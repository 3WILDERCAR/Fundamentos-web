package com.example.lab0202

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.lab0202.ui.theme.Lab0202Theme
import kotlinx.coroutines.delay

// ---------------------------------------------------------------------
// ENUM que define los 3 estados del semáforo
// ---------------------------------------------------------------------
enum class Light { Red, Yellow, Green }

// ---------------------------------------------------------------------
// MAIN ACTIVITY
// ---------------------------------------------------------------------
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Lab0202Theme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    TrafficLightScreen()
                }
            }
        }
    }
}

// ---------------------------------------------------------------------
// UI PRINCIPAL DEL SEMÁFORO
// ---------------------------------------------------------------------
@Composable
fun TrafficLightScreen() {

    // Estado que indica qué luz está activa actualmente
    var currentLight by remember { mutableStateOf(Light.Red) }

    // LaunchedEffect ejecuta un ciclo infinito que cambia las luces con delay
    LaunchedEffect(Unit) {
        while (true) {
            currentLight = Light.Red
            delay(2000)

            currentLight = Light.Green
            delay(2000)

            currentLight = Light.Yellow
            delay(1000)
        }
    }

    // Estructura visual (usando Scaffold para mantener tu estructura original)
    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {

            // Caja externa del semáforo (marco)
            Box(
                modifier = Modifier
                    .width(180.dp)
                    .height(420.dp)
                    .background(Color(0xFF111111), shape = MaterialTheme.shapes.large)
                    .padding(vertical = 28.dp),
                contentAlignment = Alignment.Center
            ) {

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceEvenly,
                    modifier = Modifier.fillMaxSize()
                ) {
                    TrafficCircle(light = Light.Red, current = currentLight)
                    TrafficCircle(light = Light.Yellow, current = currentLight)
                    TrafficCircle(light = Light.Green, current = currentLight)
                }
            }
        }
    }
}

// ---------------------------------------------------------------------
// CÍRCULO INDIVIDUAL DEL SEMÁFORO
// ---------------------------------------------------------------------
@Composable
fun TrafficCircle(light: Light, current: Light) {

    // Selección de color: activo = brillante, inactivo = gris
    val color = if (light == current) {
        when (light) {
            Light.Red -> Color.Red
            Light.Yellow -> Color.Yellow
            Light.Green -> Color.Green
        }
    } else {
        Color(0xFF555555)
    }

    Box(
        modifier = Modifier
            .size(120.dp)
            .clip(CircleShape)
            .background(color)
    )
}

// ---------------------------------------------------------------------
// PREVIEW PARA ANDROID STUDIO
// ---------------------------------------------------------------------
@Preview(showBackground = true, showSystemUi = true)
@Composable
fun TrafficLightPreview() {
    Lab0202Theme {
        TrafficLightScreen()
    }
}
