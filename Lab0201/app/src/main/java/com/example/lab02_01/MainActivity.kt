package com.example.lab02_01

// --- Android Core ---
// Bundle: Estructura usada por Android para pasar datos entre componentes.
import android.os.Bundle

// --- AndroidX Activity ---
// ComponentActivity: Activity base moderna compatible con Jetpack Compose.
// setContent: Establece el contenido de la UI usando Compose.
// enableEdgeToEdge: Permite que la aplicación use la pantalla completa sin barras opacas.
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

// --- Jetpack Compose Foundation Layouts ---
// Conjunto de layouts esenciales: Column, Row, Box, Spacer, padding, tamaños y expansiones.
import androidx.compose.foundation.layout.*

// --- Material 3 Icons ---
// Icons: Contenedor de íconos vectoriales.
// filled.Refresh: Ícono de "refrescar" usado para el botón de lanzar dados.
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh

// --- Material 3 Components ---
// Componentes modernos basados en Material Design 3: botones, tarjetas, tipografías y estructura visual.
import androidx.compose.material3.*

// --- Compose Runtime ---
// APIs de estado reactivo: remember, mutableStateOf, recomposición.
// Permiten que la UI responda automáticamente a cambios.
import androidx.compose.runtime.*

// --- Compose UI Core ---
// Alignment: Posicionamiento dentro de composables.
// Modifier: Configura tamaño, padding, comportamiento, etc.
// Color: Soporte para colores RGBA.
// FontWeight: Grosor de texto.
// TextAlign: Alineación de texto.
// Preview: Permite ver composables sin ejecutar la app.
// dp, sp: Unidades de medida para Compose.
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// --- Kotlin Coroutines ---
// delay: Pausa no bloqueante para animaciones.
// launch: Inicia corrutinas para trabajo asíncrono.
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val ANIMATION_ITERATIONS = 15
private const val ANIMATION_DELAY_MS = 80L
private const val MAX_DICE_VALUE = 20
private const val MIN_DICE_VALUE = 1

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DiceRollerScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
// En la función solo se agregan la cantidad de dados que nosotros queremos
//En este caso es 3 y como también queremos 3 botones para cada dado se agrega rollin n

fun DiceRollerScreen() {
    var vit by remember { mutableIntStateOf(10) }
    var dex by remember { mutableIntStateOf(10) }
    var wis by remember { mutableIntStateOf(10) }
    var rolling1 by remember { mutableStateOf(false) }
    var rolling2 by remember { mutableStateOf(false) }
    var rolling3 by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

    // Esta Función se encarga de que cada dado se puede lanzar de forma individual
    //En este caso se asigna un index para que cada dado pueda ser identificado
    fun rollSingleDice(diceIndex: Int) {
        coroutineScope.launch {
            when (diceIndex) {
                1 -> rolling1 = true
                2 -> rolling2 = true
                3 -> rolling3 = true
            }
            repeat(ANIMATION_ITERATIONS) {
                val value = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
                when (diceIndex) {
                    1 -> vit = value
                    2 -> dex = value
                    3 -> wis = value
                }
                delay(ANIMATION_DELAY_MS)
            }
            val finalValue = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
            when (diceIndex) {
                1 -> { vit = finalValue; rolling1 = false }
                2 -> { dex = finalValue; rolling2 = false }
                3 -> { wis = finalValue; rolling3 = false }
            }
        }
    }
    // realiza la suma del total de los 3 dados
    val total = vit + dex + wis


    // mensaje según el puntaje
    val message: String
    val color: Color

    // info investigada: el when es un equivalente de switch usado en Java
    // esto sirve para poder varias condiciones en vez de anidar varios if´s
    when {
        total < 30 -> {
            message = "Bad"
            color = Color.Red
        }
        // si el valor es <30 imprime bad de color rojo
        total == 50 -> {
            message = "Godlike!"
            color = Color(0xFFFFD700) // dorado
        }

        // si el valor es >50 se imprime Godlike y se cambia el color a dorado

        else -> {
            message = "Good Character"
            color = Color.Black
        }
    }


        // si el valor está entre 30 y 50 imprime el número de color negro


        //coloca el titulo de la app
    Scaffold(
        topBar = {
            TopAppBar(title = {
                Text(
                    "RPG Character Creator by Wilder Cardoza",
                    style = MaterialTheme.typography.titleLarge
                )
            })
        }
        //
    ){ paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
        // Define en que posición u orden va a estar cada cado, también se puede modificar
        // el tamaño
            DiceRow(label = "VIT", vit, rolling1) { rollSingleDice(1) }
            Spacer(modifier = Modifier.height(16.dp))

            DiceRow(label = "DEX", dex, rolling2) { rollSingleDice(2) }
            Spacer(modifier = Modifier.height(16.dp))

            DiceRow(label = "WIS", wis, rolling3) { rollSingleDice(3) }

            Spacer(modifier = Modifier.height(40.dp))

        // Esta función text sirve para poder modificar el tamaño del total, es decir
        // el texto que aparece abajo de todos los dados

            Text(
                text = "TOTAL: $total",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(20.dp))


            Text(
                text = message,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = color,
                textAlign = TextAlign.Center
            )
        }
    }
}



// Composable que representa una fila de atributo con su valor y botón para tirar el dado
@Composable
fun DiceRow(label: String, diceValue: Int, isRolling: Boolean, onRoll: () -> Unit) {

    // Tarjeta que contiene toda la fila del atributo
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFF5F5F5)
        ),
        shape = MaterialTheme.shapes.medium
    ) {

        // Distribuye el texto, número y botón en una línea
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {

            // Nombre del atributo (VIT, DEX, WIS)
            Text(
                text = label,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            // Contenedor del número del dado
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                // Valor actual del dado
                Text(
                    text = diceValue.toString(),
                    fontSize = 52.sp,
                    fontWeight = FontWeight.Bold,
                    color = getDiceValueColor(diceValue, isRolling)
                )
            }

            // Botón para tirar el dado
            Button(
                onClick = onRoll,
                enabled = !isRolling, // se desactiva mientras está animando
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Red,
                    contentColor = Color.White
                ),
                modifier = Modifier.height(48.dp)
            ) {

                // Icono de recargar
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Roll Dice",
                    modifier = Modifier.size(22.dp)
                )

                Spacer(modifier = Modifier.width(6.dp))

                // Texto cambia mientras está tirando
                Text(
                    text = if (isRolling) "..." else "Roll",
                    fontSize = 16.sp
                )
            }
        }
    }
}


private fun getDiceValueColor(value: Int, isRolling: Boolean): Color {
    return when {
        isRolling -> Color(0xFF666666)
        value == MAX_DICE_VALUE -> Color(0xFFFFD700)
        value == MIN_DICE_VALUE -> Color(0xFFDC143C)
        else -> Color(0xFF333333)
    }
}

@Preview(
    showBackground = true,
    showSystemUi = true,
    name = "Dice Roller Preview"
)
@Composable
fun DiceRollerScreenPreview() {
    MaterialTheme {
        DiceRollerScreen()
    }
}
