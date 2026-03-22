import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

const ScooterServicesSection: React.FC = () => {
    return (
        <section id="scooter-servicios" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-amber-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="text-center mb-16">
                    <Badge variant="warning" className="mb-4 px-4 py-1.5 text-[10px] tracking-[0.3em]">EXCLUSIVO SCOOTER</Badge>
                    <h2 className="text-5xl md:text-7xl font-black heading-racing text-white mb-6 italic tracking-tighter">
                        ESPECIALISTAS EN <br />
                        <span className="text-amber-500 text-glow-amber">MANTENIMIENTO GENERAL</span>
                    </h2>
                    <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed">
                        Nuestros servicios para scooter están diseñados específicamente para este tipo de vehículo, considerando su sistema de transmisión automática (**CVT**), configuración del motor y uso urbano.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* SCOOTER CARD */}
                    <div className="relative group overflow-hidden rounded-[3rem] border border-amber-500/30 bg-black/80 shadow-[0_0_50px_rgba(245,158,11,0.1)] transition-all duration-500 hover:border-amber-500 hover:shadow-[0_0_80px_rgba(245,158,11,0.2)] flex flex-col">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={200} className="text-amber-500" />
                        </div>
                        <div className="p-12 flex flex-col h-full relative z-10 w-full">
                            <Badge variant="outline" className="self-start mb-8 border-amber-500/50 text-amber-500 transition-colors">AUTOMÁTICAS Y CVT</Badge>
                            <h3 className="heading-racing text-6xl text-white italic mb-4">MANTENIMIENTO <br/><span className="text-amber-500">SCOOTER</span></h3>
                            <p className="text-zinc-400 text-lg font-medium mb-12 max-w-xl">
                                Limpieza y ajuste de CVT, revisión de rodillos, lubricación de guías, cambio de aceite de motor y transmisión, calibración de frenos y revisión general. Todo lo que tu scooter necesita para dominar la ciudad.
                            </p>
                            
                            <div className="mt-auto pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                <div className="flex flex-col">
                                    <span className="text-sm uppercase font-black tracking-widest text-zinc-500 mb-2">Precio Fijo Especializado</span>
                                    <span className="text-7xl heading-racing italic text-white font-black">$35</span>
                                </div>
                                <Button 
                                    className="h-16 px-10 heading-racing text-2xl italic w-full md:w-auto"
                                    onClick={() => window.open('https://wa.me/584147131270?text=Hola%20Motocadena%20SCOOTER%2C%20quiero%20agendar%20un%20mantenimiento%20general%20SCOOTER', '_blank')}
                                >
                                    AGENDAR AHORA <ArrowRight className="w-6 h-6 ml-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <Button
                        variant="ghost"
                        className="text-zinc-500 hover:text-white"
                        onClick={() => window.open('https://wa.me/584147131270?text=Hola%20Motocadena%2C%20quiero%20consultar%20sobre%20otros%20servicios%20especificos%20para%20Scooter', '_blank')}
                    >
                        ¿Buscas una reparación mayor o servicio específico? Contáctanos <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ScooterServicesSection;
