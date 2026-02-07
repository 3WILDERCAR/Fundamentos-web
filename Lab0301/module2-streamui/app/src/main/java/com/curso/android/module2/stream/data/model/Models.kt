package com.curso.android.module2.stream.data.model

import kotlinx.serialization.Serializable

/**
 * ================================================================================
 * MODELS.KT - Modelos de Datos
 * ================================================================================
 *
 * Este archivo define las entidades principales del dominio de la aplicación.
 *
 * La anotación @Serializable permite que estas clases puedan ser serializadas
 * para Navigation Compose (type-safe arguments).
 */

@Serializable
data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val colorSeed: Int, // Usado para generar gradientes en SongCoverMock

 
    val isFavorite: Boolean = false
)

@Serializable
data class Category(
    val name: String,
    val songs: List<Song>
)
