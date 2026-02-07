package com.curso.android.module2.stream.ui.viewmodel

import androidx.lifecycle.ViewModel
import com.curso.android.module2.stream.data.model.Category
import com.curso.android.module2.stream.data.repository.MusicRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * ================================================================================
 * HOME VIEW MODEL - Lógica de Presentación
 * ================================================================================
 *
 * (Todos tus comentarios se mantienen exactamente igual…)
 */

/**
 * Estado de la pantalla Home.
 */
sealed interface HomeUiState {
    data object Loading : HomeUiState

    data class Success(
        val categories: List<Category>
    ) : HomeUiState

    data class Error(
        val message: String
    ) : HomeUiState
}

class HomeViewModel(
    private val repository: MusicRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)

    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadCategories()
    }

    private fun loadCategories() {
        _uiState.value = HomeUiState.Loading

        val categories = repository.getCategories()

        _uiState.value = HomeUiState.Success(categories)
    }

    fun refresh() {
        loadCategories()
    }

    /**

     *
     * ESTO ES CLAVE:
     * - La UI nunca modifica el estado.
     * - La UI solo llama a este método y el ViewModel actualiza el StateFlow.
     *
     * LÓGICA:
     * 1. Tomamos el estado actual
     * 2. Buscamos la canción por ID
     * 3. Creamos una COPIA inmutable de las categorías y canciones
     * 4. Invertimos la propiedad isFavorite
     * 5. Emitimos un NUEVO estado (UDF)
     */
    fun toggleFavorite(songId: String) {
        val currentState = _uiState.value

        if (currentState is HomeUiState.Success) {

            val updatedCategories = currentState.categories.map { category ->
                category.copy(
                    songs = category.songs.map { song ->
                        if (song.id == songId) {
                            song.copy(isFavorite = !song.isFavorite)
                        } else song
                    }
                )
            }

            _uiState.value = HomeUiState.Success(updatedCategories)
        }
    }
}
