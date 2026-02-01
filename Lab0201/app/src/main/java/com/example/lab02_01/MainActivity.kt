package com.example.lab02_01

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
fun DiceRollerScreen() {
    var dice1 by remember { mutableIntStateOf(MIN_DICE_VALUE) }
    var dice2 by remember { mutableIntStateOf(MIN_DICE_VALUE) }
    var dice3 by remember { mutableIntStateOf(MIN_DICE_VALUE) }
    var rolling1 by remember { mutableStateOf(false) }
    var rolling2 by remember { mutableStateOf(false) }
    var rolling3 by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

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
                    1 -> dice1 = value
                    2 -> dice2 = value
                    3 -> dice3 = value
                }
                delay(ANIMATION_DELAY_MS)
            }
            val finalValue = (MIN_DICE_VALUE..MAX_DICE_VALUE).random()
            when (diceIndex) {
                1 -> { dice1 = finalValue; rolling1 = false }
                2 -> { dice2 = finalValue; rolling2 = false }
                3 -> { dice3 = finalValue; rolling3 = false }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = {
                Text(
                    "RPG Dice Roller",
                    style = MaterialTheme.typography.titleLarge
                )
            })
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
            DiceRow(dice1, rolling1) { rollSingleDice(1) }
            Spacer(modifier = Modifier.height(16.dp))
            DiceRow(dice2, rolling2) { rollSingleDice(2) }
            Spacer(modifier = Modifier.height(16.dp))
            DiceRow(dice3, rolling3) { rollSingleDice(3) }
        }
    }
}

@Composable
fun DiceRow(diceValue: Int, isRolling: Boolean, onRoll: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        Box(
            modifier = Modifier.size(120.dp),
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
        Button(
            onClick = onRoll,
            enabled = !isRolling,
            modifier = Modifier.height(50.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = "Roll Dice",
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = if (isRolling) "Rolling..." else "Roll")
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
