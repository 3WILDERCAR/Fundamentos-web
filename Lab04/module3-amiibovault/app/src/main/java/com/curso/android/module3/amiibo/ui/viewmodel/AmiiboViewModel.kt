package com.curso.android.module3.amiibo.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.curso.android.module3.amiibo.data.local.entity.AmiiboEntity
import com.curso.android.module3.amiibo.domain.error.AmiiboError
import com.curso.android.module3.amiibo.domain.error.ErrorType
import com.curso.android.module3.amiibo.repository.AmiiboRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * Estado de la UI para Amiibos.
 */
sealed interface AmiiboUiState {

    // Estado de carga inicial
    data object Loading : AmiiboUiState

    // Estado exitoso con datos
    data class Success(
        val amiibos: List<AmiiboEntity>,
        val isRefreshing: Boolean = false
    ) : AmiiboUiState

    // Estado de error con datos opcionales en caché
    data class Error(
        val message: String,
        val errorType: ErrorType = ErrorType.UNKNOWN,
        val isRetryable: Boolean = true,
        val cachedAmiibos: List<AmiiboEntity> = emptyList()
    ) : AmiiboUiState
}

/**
 * ViewModel para Amiibos.
 * Maneja estado de UI, paginación y refresco de datos.
 */
class AmiiboViewModel(
    private val repository: AmiiboRepository
) : ViewModel() {

    // Estado interno mutable
    private val _uiState = MutableStateFlow<AmiiboUiState>(AmiiboUiState.Loading)

    // Estado público observable
    val uiState: StateFlow<AmiiboUiState> = _uiState.asStateFlow()

    // Tamaño de página y opciones
    private val _pageSize = MutableStateFlow(AmiiboRepository.DEFAULT_PAGE_SIZE)
    val pageSize: StateFlow<Int> = _pageSize.asStateFlow()
    val pageSizeOptions: List<Int> = AmiiboRepository.PAGE_SIZE_OPTIONS

    // Paginación
    private val _currentPage = MutableStateFlow(0)
    private val _loadedAmiibos = MutableStateFlow<List<AmiiboEntity>>(emptyList())
    private val _hasMorePages = MutableStateFlow(true)
    val hasMorePages: StateFlow<Boolean> = _hasMorePages.asStateFlow()
    private val _isLoadingMore = MutableStateFlow(false)
    val isLoadingMore: StateFlow<Boolean> = _isLoadingMore.asStateFlow()

    // Error específico de paginación
    private val _paginationError = MutableStateFlow<String?>(null)
    val paginationError: StateFlow<String?> = _paginationError.asStateFlow()

    // Observación de datos desde DB
    private val amiibosFromDb: StateFlow<List<AmiiboEntity>> = repository
        .observeAmiibos()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList()
        )

    init {
        observeDatabaseChanges()
        refreshAmiibos()
    }

    /**
     * Observa cambios en la DB y actualiza el UIState
     */
    private fun observeDatabaseChanges() {
        viewModelScope.launch {
            amiibosFromDb.collect { amiibos ->
                val currentState = _uiState.value
                if (amiibos.isNotEmpty()) {
                    _uiState.value = AmiiboUiState.Success(
                        amiibos = amiibos,
                        isRefreshing = currentState is AmiiboUiState.Success &&
                                (currentState as? AmiiboUiState.Success)?.isRefreshing == true
                    )
                }
            }
        }
    }

    /**
     * Cambia tamaño de página y reinicia paginación
     */
    fun setPageSize(newSize: Int) {
        if (newSize != _pageSize.value && newSize in pageSizeOptions) {
            _pageSize.value = newSize
            resetPagination()
            loadFirstPage()
        }
    }

    /**
     * Reinicia estado de paginación
     */
    private fun resetPagination() {
        _currentPage.value = 0
        _loadedAmiibos.value = emptyList()
        _hasMorePages.value = true
        _paginationError.value = null
    }

    /**
     * Carga la siguiente página (Infinite Scroll)
     */
    fun loadNextPage() {
        if (_isLoadingMore.value || !_hasMorePages.value || _paginationError.value != null) return

        viewModelScope.launch {
            _isLoadingMore.value = true
            _paginationError.value = null

            try {
                val nextPage = _currentPage.value + 1
                val newItems = repository.getAmiibosPage(nextPage, _pageSize.value)

                if (newItems.isNotEmpty()) {
                    _currentPage.value = nextPage
                    _loadedAmiibos.value = _loadedAmiibos.value + newItems
                    _hasMorePages.value = repository.hasMorePages(nextPage, _pageSize.value)

                    _uiState.value = AmiiboUiState.Success(
                        amiibos = _loadedAmiibos.value,
                        isRefreshing = false
                    )
                } else {
                    _hasMorePages.value = false
                }
            } catch (e: Exception) {
                _paginationError.value = e.message ?: "Error al cargar más items"
            } finally {
                _isLoadingMore.value = false
            }
        }
    }

    /**
     * Reintenta la carga de página en caso de error
     */
    fun retryLoadMore() {
        _paginationError.value = null
        loadNextPage()
    }

    /**
     * Carga la primera página de datos
     */
    private fun loadFirstPage() {
        viewModelScope.launch {
            try {
                val firstPageItems = repository.getAmiibosPage(0, _pageSize.value)
                _currentPage.value = 0
                _loadedAmiibos.value = firstPageItems
                _hasMorePages.value = repository.hasMorePages(0, _pageSize.value)

                _uiState.value = AmiiboUiState.Success(
                    amiibos = firstPageItems,
                    isRefreshing = false
                )
            } catch (e: Exception) {
                val cachedAmiibos = amiibosFromDb.value
                _uiState.value = AmiiboUiState.Error(
                    message = "Error al cargar datos",
                    isRetryable = true,
                    cachedAmiibos = cachedAmiibos
                )
            }
        }
    }

    /**
     * Refresca datos desde la API
     */
    fun refreshAmiibos() {
        viewModelScope.launch {
            val cachedAmiibos = amiibosFromDb.value

            _uiState.value = if (cachedAmiibos.isEmpty()) {
                AmiiboUiState.Loading
            } else {
                AmiiboUiState.Success(
                    amiibos = cachedAmiibos,
                    isRefreshing = true
                )
            }

            try {
                repository.refreshAmiibos()
                resetPagination()
                val firstPageItems = repository.getAmiibosPage(0, _pageSize.value)
                _loadedAmiibos.value = firstPageItems
                _hasMorePages.value = repository.hasMorePages(0, _pageSize.value)

                _uiState.value = AmiiboUiState.Success(
                    amiibos = firstPageItems,
                    isRefreshing = false
                )

            } catch (e: AmiiboError) {
                val currentCachedAmiibos = amiibosFromDb.value
                val errorType = ErrorType.from(e)
                val isRetryable = when (e) {
                    is AmiiboError.Network -> true
                    is AmiiboError.Parse -> false
                    is AmiiboError.Database -> true
                    is AmiiboError.Unknown -> true
                }

                _uiState.value = AmiiboUiState.Error(
                    message = e.message,
                    errorType = errorType,
                    isRetryable = isRetryable,
                    cachedAmiibos = currentCachedAmiibos
                )
            } catch (e: Exception) {
                val currentCachedAmiibos = amiibosFromDb.value
                _uiState.value = AmiiboUiState.Error(
                    message = e.message ?: "Error desconocido",
                    errorType = ErrorType.UNKNOWN,
                    isRetryable = true,
                    cachedAmiibos = currentCachedAmiibos
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