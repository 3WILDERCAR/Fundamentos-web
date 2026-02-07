package com.curso.android.module2.stream.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import com.curso.android.module2.stream.data.model.Song

/**
 * SongCard - Versión compacta y mecánica
 *
 * STATELESS → recibe todo desde afuera.
 *
 * - song: Song     → datos
 * - onFavoriteClick(id)  → evento hoisted hacia ViewModel
 */
@Composable
fun SongCard(
    song: Song,
    onFavoriteClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp, horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        // Mini cover cuadrado con gradiente
        Box(
            modifier = Modifier
                .size(52.dp)
                .background(
                    Brush.linearGradient(
                        listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.secondary
                        )
                    ),
                    shape = MaterialTheme.shapes.small
                )
        )

        Spacer(Modifier.width(12.dp))

        // Info compacta
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = song.title,
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = song.artist,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Botón de favorito (Spotify style)
        IconButton(
            onClick = { onFavoriteClick(song.id) },
            modifier = Modifier.size(40.dp) // más compacto
        ) {
            Icon(
                imageVector = if (song.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                tint = if (song.isFavorite) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                contentDescription = null
            )
        }
    }
}
