import Header from './components/Header';
import Foro from './components/Foro';

function App() {
  return (
    // 'min-h-screen' asegura que el fondo gris cubra toda la pantalla de arriba a abajo
    <div className="min-h-screen bg-gray-100">
      
      {/* El Header se quedará pegado arriba */}
      <Header />

      {/* El contenido principal (Foro) con un poco de espacio a los lados */}
      <main className="px-4">
        <Foro />
      </main>
    </div>
  );
}

export default App;