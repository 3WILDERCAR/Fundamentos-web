package com.curso.android.module2.stream

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.curso.android.module2.stream.data.repository.MusicRepository
import com.curso.android.module2.stream.ui.navigation.HighlightsDestination
import com.curso.android.module2.stream.ui.navigation.HomeDestination
import com.curso.android.module2.stream.ui.navigation.LibraryDestination
import com.curso.android.module2.stream.ui.navigation.PlayerDestination
import com.curso.android.module2.stream.ui.navigation.SearchDestination
import com.curso.android.module2.stream.ui.screens.HighlightsScreen
import com.curso.android.module2.stream.ui.screens.HomeScreen
import com.curso.android.module2.stream.ui.screens.LibraryScreen
import com.curso.android.module2.stream.ui.screens.PlayerScreen
import com.curso.android.module2.stream.ui.screens.SearchScreen
import com.curso.android.module2.stream.ui.theme.StreamUITheme
import com.curso.android.module2.stream.ui.viewmodel.HomeViewModel
import org.koin.compose.koinInject
import org.koin.compose.viewmodel.koinViewModel
import kotlin.reflect.KClass

/**
 * ================================================================================
 * MAIN ACTIVITY - Punto de Entrada de la UI
 * ================================================================================
 *
 * SINGLE ACTIVITY ARCHITECTURE
 * ----------------------------
 * En apps Compose modernas, típicamente usamos UNA sola Activity.
 * Toda la navegación se maneja internamente con Navigation Compose.
 *
 * Ventajas:
 * - Navegación más fluida (sin recrear Activities)
 * - Estado compartido más fácil
 * - Transiciones personalizables
 * - Mejor integración con Compose
 *
 * COMPONENTES CLAVE:
 * ------------------
 * 1. ComponentActivity: Base moderna para Compose
 * 2. setContent { }: Establece la raíz del árbol de Compose
 * 3. NavHost: Contenedor de destinos de navegación
 * 4. NavController: Controla la navegación (back stack)
 * 5. NavigationBar: Barra de navegación inferior (Bottom Navigation)
 *
 * EDGE TO EDGE:
 * -------------
 * enableEdgeToEdge() hace que la app dibuje detrás de las barras
 * del sistema (status bar, navigation bar). Esto permite UIs
 * más inmersivas con colores personalizados en las barras.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Habilita dibujo edge-to-edge (detrás de barras del sistema)
        enableEdgeToEdge()

        /**
         * setContent { }
         * --------------
         * Establece el contenido de la Activity usando Compose.
         * Todo lo que está dentro es un árbol de Composables.
         *
         * Este es el ÚNICO lugar donde conectamos el mundo tradicional
         * de Android (Activities) con el mundo de Compose.
         */
        setContent {
            StreamUITheme {
                StreamUIApp()
            }
        }
    }
}

/**
 * ================================================================================
 * BOTTOM NAVIGATION ITEM
 * ================================================================================
 *
 * Define los elementos del BottomNavigation con sus propiedades.
 *
 * PATRÓN: Cada item tiene:
 * - route: La clase de destino para navegación type-safe
 * - label: Texto que se muestra debajo del ícono
 * - selectedIcon: Ícono cuando el tab está seleccionado (filled)
 * - unselectedIcon: Ícono cuando el tab no está seleccionado (outlined)
 *
 * ICONOS FILLED vs OUTLINED:
 * -------------------------
 * Es una convención de Material Design usar iconos filled para
 * el estado seleccionado y outlined para el no seleccionado.
 * Esto proporciona feedback visual claro al usuario.
 */
data class BottomNavItem(
    val route: KClass<*>,
    val label: String,
    val selectedIcon: @Composable () -> ImageVector,
    val unselectedIcon: @Composable () -> ImageVector
)

/**
 * Lista de items del BottomNavigation.
 *
 * Nota: Para el ícono de Library usamos un recurso drawable personalizado
 * ya que Icons.Default no incluye un ícono de biblioteca de música apropiado.
 * Se usa el mismo ícono para ambos estados (selected/unselected) como fallback.
 */
@Composable
fun getBottomNavItems(): List<BottomNavItem> {
    val libraryIcon = ImageVector.vectorResource(R.drawable.ic_library)
    return listOf(
        BottomNavItem(
            route = HomeDestination::class,
            label = "Home",
            selectedIcon = { Icons.Filled.Home },
            unselectedIcon = { Icons.Outlined.Home }
        ),
        BottomNavItem(
            route = HighlightsDestination::class,
            label = "Highlights",
            selectedIcon = { Icons.Filled.Star },
            unselectedIcon = { Icons.Outlined.Star }
        ),
        BottomNavItem(
            route = SearchDestination::class,
            label = "Search",
            selectedIcon = { Icons.Filled.Search },
            unselectedIcon = { Icons.Outlined.Search }
        ),
        BottomNavItem(
            route = LibraryDestination::class,
            label = "Library",
            selectedIcon = { libraryIcon },
            unselectedIcon = { libraryIcon }
        )
    )
}

/**
 * Composable raíz de la aplicación.
 * ... (comentarios omitidos por brevedad pero mantenidos en lógica)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StreamUIApp() {
    val navController = rememberNavController()
    val repository: MusicRepository = koinInject()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val bottomNavItems = getBottomNavItems()
    val showBottomBar = bottomNavItems.any { item ->
        currentDestination?.hasRoute(item.route) == true
    }

    /**
     * Título dinámico del TopAppBar
     * -----------------------------
     * Cambia según la pantalla actual para dar contexto al usuario.
     */
    val topBarTitle = when {
        currentDestination?.hasRoute(HomeDestination::class) == true -> "StreamUI"
        currentDestination?.hasRoute(HighlightsDestination::class) == true -> "Highlights"
        currentDestination?.hasRoute(SearchDestination::class) == true -> "Search"
        currentDestination?.hasRoute(LibraryDestination::class) == true -> "Your Library"
        currentDestination?.hasRoute(PlayerDestination::class) == true -> "Now Playing"
        else -> "StreamUI"
    }

    // Compartimos el ViewModel para que Home y Highlights sincronicen favoritos
    val sharedHomeViewModel: HomeViewModel = koinViewModel()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = topBarTitle,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                if (showBottomBar) {
                    NavigationBar {
                        bottomNavItems.forEach { item ->
                            val selected = currentDestination?.hierarchy?.any {
                                it.hasRoute(item.route)
                            } == true

                            NavigationBarItem(
                                selected = selected,
                                onClick = {
                                    navController.navigate(
                                        when (item.route) {
                                            HomeDestination::class -> HomeDestination
                                            HighlightsDestination::class -> HighlightsDestination
                                            SearchDestination::class -> SearchDestination
                                            LibraryDestination::class -> LibraryDestination
                                            else -> HomeDestination
                                        }
                                    ) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                icon = {
                                    Icon(
                                        imageVector = if (selected) item.selectedIcon() else item.unselectedIcon(),
                                        contentDescription = item.label
                                    )
                                },
                                label = { Text(item.label) }
                            )
                        }
                    }
                }
            }
        ) { paddingValues ->
            NavHost(
                navController = navController,
                startDestination = HomeDestination,
                modifier = Modifier.padding(paddingValues)
            ) {
                composable<HomeDestination> {
                    HomeScreen(
                        viewModel = sharedHomeViewModel,
                        onSongClick = { song ->
                            navController.navigate(PlayerDestination(songId = song.id))
                        },
                        onFavoriteClick = sharedHomeViewModel::toggleFavorite
                    )
                }

                /**
                 * DESTINO: Highlights Screen
                 * -------------------------
                 * Muestra solo las canciones favoritas.
                 * Usa el sharedHomeViewModel para sincronización inmediata.
                 */
                composable<HighlightsDestination> {
                    HighlightsScreen(
                        viewModel = sharedHomeViewModel,
                        onSongClick = { songId ->
                            navController.navigate(PlayerDestination(songId = songId))
                        }
                    )
                }

                composable<SearchDestination> {
                    SearchScreen(
                        onSongClick = { song ->
                            navController.navigate(PlayerDestination(songId = song.id))
                        },
                        onBackClick = { }
                    )
                }

                composable<LibraryDestination> {
                    LibraryScreen(
                        onPlaylistClick = { }
                    )
                }

                composable<PlayerDestination> { backStackEntry ->
                    val destination = backStackEntry.toRoute<PlayerDestination>()
                    val song = repository.getSongById(destination.songId)

                    PlayerScreen(
                        song = song,
                        onBackClick = {
                            navController.popBackStack()
                        }
                    )
                }
            }
        }
    }
}