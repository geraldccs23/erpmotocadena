import React from 'react';
import { Zap, Settings, ArrowRight } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

const ServicesSection: React.FC = () => {
    return (
        <section id="servicios" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-amber-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <Badge variant="warning" className="mb-4">MANTENIMIENTO PREMIUM</Badge>
                    <h2 className="text-5xl md:text-7xl font-black heading-racing text-white mb-6 italic tracking-tighter">
                        ESPECIALISTAS EN <br />
                        <span className="text-amber-500 text-glow-amber">MANTENIMIENTO GENERAL</span>
                    </h2>
                    <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed font-medium">
                        Nos enfocamos en la excelencia. Ofrecemos el mantenimiento general más completo y detallado del mercado, asegurando que tu máquina esté siempre lista para la pista o la ciudad.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {/* STANDARD CARD */}
                    <div className="relative group overflow-hidden rounded-[3rem] border border-zinc-800 bg-black/60 shadow-2xl transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Settings size={140} className="text-amber-500" />
                        </div>
                        <div className="p-10 flex flex-col h-full relative z-10 w-full">
                            <Badge variant="outline" className="self-start mb-6 border-zinc-700 text-zinc-400 group-hover:border-amber-500 group-hover:text-amber-500 transition-colors">MOTOS DE CAMBIO</Badge>
                            <h3 className="heading-racing text-5xl text-white italic mb-2">MOTO <br/>STANDARD</h3>
                            <p className="text-zinc-500 font-medium mb-8">Mantenimiento preventivo integral para motocicletas de transmisión manual y alto rendimiento.</p>
                            
                            <div className="mt-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase font-black tracking-widest text-zinc-600 mb-1">Precio Fijo</span>
                                    <span className="text-6xl heading-racing italic text-amber-500 font-black">$25</span>
                                </div>
                                <Button 
                                    className="h-14 px-8 heading-racing text-xl italic w-full sm:w-auto"
                                    onClick={() => window.open('https://wa.me/584147131270?text=Hola%20Motocadena%2C%20quiero%20agendar%20un%20mantenimiento%20general%20STANDARD', '_blank')}
                                >
                                    AGENDAR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* SCOOTER CARD */}
                    <div className="relative group overflow-hidden rounded-[3rem] border border-zinc-800 bg-black/60 shadow-2xl transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={140} className="text-amber-500" />
                        </div>
                        <div className="p-10 flex flex-col h-full relative z-10 w-full">
                            <Badge variant="outline" className="self-start mb-6 border-zinc-700 text-zinc-400 group-hover:border-amber-500 group-hover:text-amber-500 transition-colors">AUTOMÁTICAS Y CVT</Badge>
                            <h3 className="heading-racing text-5xl text-white italic mb-2">MOTO <br/>SCOOTER</h3>
                            <p className="text-zinc-500 font-medium mb-8">Especialistas en sistemas CVT. Cuidado exhaustivo para máxima fluidez en tus recorridos urbanos.</p>
                            
                            <div className="mt-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase font-black tracking-widest text-zinc-600 mb-1">Precio Fijo</span>
                                    <span className="text-6xl heading-racing italic text-amber-500 font-black">$35</span>
                                </div>
                                <Button 
                                    className="h-14 px-8 heading-racing text-xl italic w-full sm:w-auto"
                                    onClick={() => window.open('https://wa.me/584147131270?text=Hola%20Motocadena%2C%20quiero%20agendar%20un%20mantenimiento%20general%20SCOOTER', '_blank')}
                                >
                                    AGENDAR
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Button
                        variant="ghost"
                        className="text-zinc-500 hover:text-white"
                        onClick={() => window.open('https://wa.me/584147131270?text=Hola%20Motocadena%2C%20quiero%20consultar%20sobre%20otros%20servicios%20especificos', '_blank')}
                    >
                        ¿Buscas otro servicio específico? Contáctanos <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
