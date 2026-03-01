package com.curso.android.module5.aichef.domain.model

/**
 * =============================================================================
 * Recipe - Modelo de dominio para recetas
 * =============================================================================
 *
 * Este modelo representa una receta generada por la IA.
 * Se usa tanto para la UI como para persistir en Firestore.
 *
 * CAMPOS:
 * - id: ID único del documento en Firestore (vacío para nuevas recetas)
 * - userId: ID del usuario propietario (de Firebase Auth)
 * - title: Título de la receta generada
 * - ingredients: Lista de ingredientes detectados
 * - steps: Pasos de preparación
 * - imageUri: URI de la imagen original (opcional)
 * - generatedImageUrl: URL de la imagen del plato generada por IA (cache en Storage)
 * - createdAt: Timestamp de creación
 *
 * =============================================================================
 */
data class Recipe(
    val id: String = "",
    val userId: String = "",
    val title: String = "",
    val ingredients: List<String> = emptyList(),
    val steps: List<String> = emptyList(),
    val imageUri: String = "",
    val generatedImageUrl: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    // 1. NUEVO CAMPO: Agregamos isFavorite (por defecto false)
    val isFavorite: Boolean = false
) {
    /**
     * Convierte el modelo a un Map para guardar en Firestore
     */
    fun toMap(): Map<String, Any> = mapOf(
        "userId" to userId,
        "title" to title,
        "ingredients" to ingredients,
        "steps" to steps,
        "imageUri" to imageUri,
        "generatedImageUrl" to generatedImageUrl,
        "createdAt" to createdAt,
        // 2. AGREGAR AL MAP: Para que se guarde en la base de datos
        "isFavorite" to isFavorite
    )

    companion object {
        /**
         * Crea una Recipe desde un documento de Firestore
         */
        @Suppress("UNCHECKED_CAST")
        fun fromFirestore(id: String, data: Map<String, Any?>): Recipe {
            return Recipe(
                id = id,
                userId = data["userId"] as? String ?: "",
                title = data["title"] as? String ?: "",
                ingredients = (data["ingredients"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                steps = (data["steps"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                imageUri = data["imageUri"] as? String ?: "",
                generatedImageUrl = data["generatedImageUrl"] as? String ?: "",
                createdAt = (data["createdAt"] as? Long) ?: System.currentTimeMillis(),
                // 3. LEER DE FIRESTORE: Recuperamos el estado del favorito
                isFavorite = data["isFavorite"] as? Boolean ?: false
            )
        }
    }
}
/**
 * =============================================================================
 * GeneratedRecipe - Resultado del análisis de IA
 * =============================================================================
 *
 * Este modelo representa la respuesta estructurada de Firebase AI Logic
 * después de analizar una imagen de ingredientes.
 */
data class GeneratedRecipe(
    val title: String,
    val ingredients: List<String>,
    val steps: List<String>
)
