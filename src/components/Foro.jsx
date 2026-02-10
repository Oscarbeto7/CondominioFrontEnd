import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { CSSTransition, SwitchTransition } from 'react-transition-group'; // <--- IMPORTANTE
import { CheckCircle, Loader2, Send } from 'lucide-react'; // Íconos bonitos

window.Pusher = Pusher;

export default function Foro() {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoTexto, setNuevoTexto] = useState("");
    
    // Estados para las transiciones
    const [cargando, setCargando] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    
    // Referencias para evitar el warning de "findDOMNode" en modo estricto
    const alertaRef = useRef(null);
    const botonRef = useRef(null);

    useEffect(() => {
        const echo = new Echo({
            broadcaster: 'pusher',
            key: 'local',
            wsHost: window.location.hostname,
            wsPort: 6001,
            wssPort: 6001,
            forceTLS: false,
            disableStats: true,
            cluster: 'mt1', 
            enabledTransports: ['ws', 'wss'],
        });

        echo.channel('foro-comunidad')
            .listen('.notificacion-recibida', (e) => {
                // Si es tipo mensaje, lo agregamos (reutilizamos tu lógica de notificaciones)
                if(e.tipo === 'mensaje' || e.mensaje) { 
                     // Ajuste: tu evento original enviaba 'usuario' y 'mensaje'
                     // El de notificaciones enviaba 'titulo' y 'detalle'
                     // Aquí unificamos para que no falle
                     const msg = e.mensaje ? e : { usuario: 'Sistema', mensaje: e.titulo };
                     setMensajes((prev) => [...prev, msg]);
                }
            })
            // También escuchamos el evento original del chat si sigue activo
            .listen('.nuevo-mensaje', (e) => {
                setMensajes((prev) => [...prev, e]);
            });

        return () => {
            echo.disconnect();
        };
    }, []);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoTexto.trim()) return;

        // 1. Iniciamos la transición de carga
        setCargando(true);
        setMostrarAlerta(false); // Ocultar alerta previa si hay

        try {
            // Simulamos un pequeño delay para que se aprecie la animación (opcional)
            await new Promise(resolve => setTimeout(resolve, 800));

            const respuesta = await fetch('http://127.0.0.1:8000/api/enviar-mensaje-foro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    mensaje: nuevoTexto
                })
            });

            if (respuesta.ok) {
                setNuevoTexto("");
                // 2. Éxito: Mostramos la alerta
                setMostrarAlerta(true);
                // La ocultamos automáticamente después de 3 segundos
                setTimeout(() => setMostrarAlerta(false), 3000);
            } else {
                console.error("Error al enviar");
            }

        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            // 3. Finalizamos la carga
            setCargando(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white mt-6 rounded-xl shadow-sm border border-gray-200 relative">
            
            {/* --- ALERTA DE ÉXITO CON TRANSICIÓN --- */}
            <CSSTransition
                nodeRef={alertaRef}
                in={mostrarAlerta}
                timeout={300}
                classNames="alerta"
                unmountOnExit
            >
                <div ref={alertaRef} className="absolute top-0 left-0 w-full -mt-16 flex justify-center">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm">¡Mensaje enviado correctamente!</span>
                    </div>
                </div>
            </CSSTransition>

            <h1 className="text-3xl font-bold mb-6 text-gray-800">Foro Vecinal</h1>
            
            {/* Área de Mensajes */}
            <div className="border border-gray-300 p-4 h-96 overflow-y-auto bg-gray-50 rounded-lg shadow-inner mb-4">
                {mensajes.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10">Sé el primero en escribir...</p>
                ) : (
                    mensajes.map((msg, index) => (
                        <div key={index} className="bg-white p-3 mb-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <p className="font-bold text-blue-700 text-sm">{msg.usuario || 'Sistema'}</p> 
                            <p className="text-gray-700">{msg.mensaje || msg.detalle}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario de Envío */}
            <form onSubmit={enviarMensaje} className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Escribe un mensaje..."
                    value={nuevoTexto}
                    onChange={(e) => setNuevoTexto(e.target.value)}
                    disabled={cargando}
                />
                
                <button 
                    type="submit"
                    disabled={cargando}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition shadow min-w-[120px] flex justify-center items-center"
                >
                    {/* SwitchTransition cambia suavemente entre el estado "Cargando" y "Enviar" */}
                    <SwitchTransition>
                        <CSSTransition
                            key={cargando ? "cargando" : "enviar"}
                            nodeRef={botonRef}
                            timeout={200}
                            classNames="boton"
                        >
                            <div ref={botonRef} className="flex items-center gap-2">
                                {cargando ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        <span>Enviando</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </div>
                        </CSSTransition>
                    </SwitchTransition>
                </button>
            </form>
        </div>
    );
}