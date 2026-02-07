package com.curso.android.module2.stream.ui.navigation

import kotlinx.serialization.Serializable

/**
 * ================================================================================
 * DESTINATIONS.KT - Definición de Rutas Type-Safe
 * ================================================================================
 * ... (resto de tus comentarios se mantienen igual)
 */

/**
 * Destino: Pantalla Principal (Home)
 */
@Serializable
data object HomeDestination

/**
 * Destino: Pantalla de Favoritos (Highlights)
 * * Nueva pantalla añadida en la Parte 2.
 * Muestra únicamente las canciones que el usuario ha marcado como favoritas.
 * Se sincroniza en tiempo real con el estado global de la aplicación.
 */
@Serializable
data object HighlightsDestination

/**
 * Destino: Pantalla de Búsqueda
 */
@Serializable
data object SearchDestination

/**
 * Destino: Pantalla de Biblioteca (Library)
 */
@Serializable
data object LibraryDestination

/**
 * Destino: Pantalla del Reproductor
 *
 * @property songId ID de la canción a reproducir
 */
@Serializable
data class PlayerDestination(
    val songId: String
)