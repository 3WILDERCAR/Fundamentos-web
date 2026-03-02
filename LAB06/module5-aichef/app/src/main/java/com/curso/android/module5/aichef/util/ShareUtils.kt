package com.curso.android.module5.aichef.util

import android.content.Context
import android.content.Intent
import com.curso.android.module5.aichef.domain.model.Recipe

object ShareUtils {
    fun shareRecipe(context: Context, recipe: Recipe) {
        // 1. Construimos el cuerpo con TODO el contenido de la receta
        val shareBody = """
            🍳 RECETA: ${recipe.title.uppercase()}
            
            🥗 INGREDIENTES:
            ${recipe.ingredients.joinToString("\n• ", prefix = "• ")}
            
            👨‍🍳 PREPARACIÓN:
            ${recipe.steps.mapIndexed { index, step -> "${index + 1}. $step" }.joinToString("\n")}
            
            🖼️ FOTO DEL PLATO:
            ${recipe.generatedImageUrl}
            
            Compartido desde IA Chef 2026 🚀
        """.trimIndent()

        // 2. Intent optimizado para redes sociales
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, shareBody)
            // EXTRA_TITLE ayuda a las apps visuales a procesar el mensaje mejor
            putExtra(Intent.EXTRA_TITLE, "Receta: ${recipe.title}")
        }

        // 3. Lanzamos el selector nativo
        val shareIntent = Intent.createChooser(sendIntent, "Compartir receta")

        // Evitamos flags innecesarios que causan bloqueos en Instagram
        context.startActivity(shareIntent)
    }
}