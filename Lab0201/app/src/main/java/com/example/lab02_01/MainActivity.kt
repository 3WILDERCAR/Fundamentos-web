package com.example.lab02_01

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val TAG = "MainActivity"
private const val ANIMATION_ITERATIONS = 15
private const val ANIMATION_DELAY_MS = 80L
private const val MAX_DICE_VALUE = 20
private const val MIN_DICE_VALUE = 1

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate: Activity creada. Inicializando UI...")
        enableEdgeToEdge()
        Log.d(TAG, "onCreate: Edge-to-Edge habilitado")
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
        Log.d(TAG, "onCreate: UI de Compose establecida correctamente")
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiceRollerScreen() {
    var dice1 by rememberSaveable { mutableIntStateOf(MIN_DICE_VALUE) }
    var dice2 by rememberSaveable { mutableIntStateOf(MIN_DICE_VALUE) }
    var dice3 by rememberSaveable { mutableIntStateOf(MIN_DICE_VALUE) }
    var isRolling by remember { mutableStateOf(false) }
    var resultMessage by rememberSaveable { mutableStateOf("Toca el botón para lanzar") }
    val coroutineScope = rememberCoroutineScope()

    fun rollDice() {
        Log.d(TAG, "rollDice: Iniciando lanzamiento del dado")
        coroutineScope.launch {
            isRolling = true
            resultMessage = "Lanzando..."
            repeat(ANIMATION_ITERATIONS) {
                dice1 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
                dice2 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
                dice3 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
                delay(ANIMATION_DELAY_MS)
            }
            dice1 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
            dice2 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
            dice3 = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
            resultMessage = "Resultados: $dice1, $dice2, $dice3"
            isRolling = false
            Log.d(TAG, "rollDice: Lanzamiento completado. Mensaje: $resultMessage")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "RPG Dice Roller",
                        style = MaterialTheme.typography.titleLarge
                    )
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            DiceBox(dice1, isRolling)
            Spacer(modifier = Modifier.height(16.dp))
            DiceBox(dice2, isRolling)
            Spacer(modifier = Modifier.height(16.dp))
            DiceBox(dice3, isRolling)
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = resultMessage,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = { rollDice() },
                enabled = !isRolling,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    disabledContainerColor = MaterialTheme.colorScheme.outline
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Lanzar dados",
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.size(8.dp))
                Text(
                    text = if (isRolling) "LANZANDO..." else "LANZAR D20",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun DiceBox(diceValue: Int, isRolling: Boolean) {
    Box(
        modifier = Modifier.size(150.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = diceValue.toString(),
            fontSize = 64.sp,
            fontWeight = FontWeight.Bold,
            color = getDiceValueColor(diceValue, isRolling),
            textAlign = TextAlign.Center
        )
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

