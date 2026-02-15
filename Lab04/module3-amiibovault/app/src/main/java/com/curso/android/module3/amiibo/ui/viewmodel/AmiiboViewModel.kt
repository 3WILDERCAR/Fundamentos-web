package com.curso.android.module3.amiibo.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.curso.android.module3.amiibo.data.local.entity.AmiiboEntity
import com.curso.android.module3.amiibo.domain.error.AmiiboError
import com.curso.android.module3.amiibo.domain.error.ErrorType
import com.curso.android.module3.amiibo.repository.AmiiboRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * Estado de la UI para Amiibos.
 */
sealed interface AmiiboUiState {

    data object Loading : AmiiboUiState

    data class Success(
        val amiibos: List<AmiiboEntity>,
        val isRefreshing: Boolean = false
    ) : AmiiboUiState

    data class Error(
        val message: String,
        val errorType: ErrorType = ErrorType.UNKNOWN,
        val isRetryable: Boolean = true,
        val cachedAmiibos: List<AmiiboEntity> = emptyList()
    ) : AmiiboUiState
}

/**
 * ViewModel.
 */
class AmiiboViewModel(
    private val repository: AmiiboRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<AmiiboUiState>(AmiiboUiState.Loading)
    val uiState: StateFlow<AmiiboUiState> = _uiState.asStateFlow()

    // Tamaño de página
    private val _pageSize = MutableStateFlow(AmiiboRepository.DEFAULT_PAGE_SIZE)
    val pageSize: StateFlow<Int> = _pageSize.asStateFlow()
    val pageSizeOptions: List<Int> = AmiiboRepository.PAGE_SIZE_OPTIONS

    // 🔍 QUERY DE BÚSQUEDA
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    // Paginación
    private val _currentPage = MutableStateFlow(0)
    private val _loadedAmiibos = MutableStateFlow<List<AmiiboEntity>>(emptyList())
    private val _hasMorePages = MutableStateFlow(true)
    val hasMorePages: StateFlow<Boolean> = _hasMorePages.asStateFlow()

    private val _isLoadingMore = MutableStateFlow(false)
    val isLoadingMore: StateFlow<Boolean> = _isLoadingMore.asStateFlow()

    private val _paginationError = MutableStateFlow<String?>(null)
    val paginationError: StateFlow<String?> = _paginationError.asStateFlow()

    // 📌 Flujo principal desde Room
    private val amiibosFromDb: StateFlow<List<AmiiboEntity>> =
        repository.observeAmiibos().stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5_000),
            emptyList()
        )


    private val filteredAmiibos: StateFlow<List<AmiiboEntity>> =
        _searchQuery
            .debounce(200) // opcional
            .flatMapLatest { query ->
                if (query.isBlank()) {
                    repository.observeAmiibos()
                } else {
                    repository.searchAmiibos(query)
                }
            }
            .stateIn(
                viewModelScope,
                SharingStarted.WhileSubscribed(5_000),
                emptyList()
            )

    // 👉 Getter público para la UI
    val filteredList: StateFlow<List<AmiiboEntity>> = filteredAmiibos

    init {
        observeDatabaseChanges()
        refreshAmiibos()
    }

    private fun observeDatabaseChanges() {
        viewModelScope.launch {
            amiibosFromDb.collect { amiibos ->
                val current = _uiState.value
                if (amiibos.isNotEmpty()) {
                    _uiState.value = AmiiboUiState.Success(
                        amiibos = amiibos,
                        isRefreshing = current is AmiiboUiState.Success &&
                                (current as? AmiiboUiState.Success)?.isRefreshing == true
                    )
                }
            }
        }
    }

    fun setPageSize(newSize: Int) {
        if (newSize != _pageSize.value && newSize in pageSizeOptions) {
            _pageSize.value = newSize
            resetPagination()
            loadFirstPage()
        }
    }

    private fun resetPagination() {
        _currentPage.value = 0
        _loadedAmiibos.value = emptyList()
        _hasMorePages.value = true
        _paginationError.value = null
    }

    fun loadNextPage() {
        if (_isLoadingMore.value || !_hasMorePages.value || _paginationError.value != null) return

        viewModelScope.launch {
            _isLoadingMore.value = true
            _paginationError.value = null

            try {
                val next = _currentPage.value + 1
                val pageData = repository.getAmiibosPage(next, _pageSize.value)

                if (pageData.isNotEmpty()) {
                    _currentPage.value = next
                    _loadedAmiibos.value = _loadedAmiibos.value + pageData
                    _hasMorePages.value = repository.hasMorePages(next, _pageSize.value)

                    _uiState.value = AmiiboUiState.Success(
                        amiibos = _loadedAmiibos.value,
                        isRefreshing = false
                    )
                } else {
                    _hasMorePages.value = false
                }
            } catch (e: Exception) {
                _paginationError.value = e.message
            } finally {
                _isLoadingMore.value = false
            }
        }
    }

    fun retryLoadMore() {
        _paginationError.value = null
        loadNextPage()
    }

    private fun loadFirstPage() {
        viewModelScope.launch {
            try {
                val items = repository.getAmiibosPage(0, _pageSize.value)
                _currentPage.value = 0
                _loadedAmiibos.value = items
                _hasMorePages.value = repository.hasMorePages(0, _pageSize.value)

                _uiState.value = AmiiboUiState.Success(items, false)

            } catch (e: Exception) {
                _uiState.value = AmiiboUiState.Error(
                    message = e.message ?: "Error al cargar datos",
                    cachedAmiibos = amiibosFromDb.value
                )
            }
        }
    }

    fun refreshAmiibos() {
        viewModelScope.launch {
            val cache = amiibosFromDb.value

            _uiState.value = if (cache.isEmpty()) {
                AmiiboUiState.Loading
            } else {
                AmiiboUiState.Success(cache, true)
            }

            try {
                repository.refreshAmiibos()
                resetPagination()

                val items = repository.getAmiibosPage(0, _pageSize.value)
                _loadedAmiibos.value = items
                _hasMorePages.value = repository.hasMorePages(0, _pageSize.value)

                _uiState.value = AmiiboUiState.Success(items, false)

            } catch (e: AmiiboError) {
                _uiState.value = AmiiboUiState.Error(
                    message = e.message,
                    errorType = ErrorType.from(e),
                    isRetryable = true,
                    cachedAmiibos = amiibosFromDb.value
                )
            }
        }
    }
}
/**
 * ============================================================================
 * NOTAS ADICIONALES SOBRE VIEWMODELS
 * ============================================================================
 *
 * 1. viewModelScope:
 *    - Scope de coroutines ligado al lifecycle del ViewModel
 *    - Se cancela automáticamente cuando el ViewModel se destruye
 *    - Usa Dispatchers.Main por defecto
 *
 * 2. SavedStateHandle (para preservar estado en process death):
 *    ```kotlin
 *    class MyViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {
 *        val searchQuery = savedStateHandle.getStateFlow("query", "")
 *
 *        fun updateQuery(query: String) {
 *            savedStateHandle["query"] = query
 *        }
 *    }
 *    ```
 *
 * 3. Parámetros de navegación con Koin:
 *    ```kotlin
 *    // En el módulo:
 *    viewModel { (id: String) -> DetailViewModel(id, get()) }
 *
 *    // En Compose:
 *    val viewModel: DetailViewModel = koinViewModel { parametersOf(amiiboId) }
 *    ```
 *
 * 4. Múltiples Flows combinados:
 *    ```kotlin
 *    val uiState = combine(
 *        amiibosFlow,
 *        searchQueryFlow,
 *        sortOrderFlow
 *    ) { amiibos, query, sort ->
 *        amiibos.filter { it.name.contains(query) }
 *               .sortedBy { if (sort == "name") it.name else it.gameSeries }
 *    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
 *    ```
 *
 * ============================================================================
 */