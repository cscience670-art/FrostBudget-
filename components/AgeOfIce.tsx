"use client";


import React from "react";
import { CloudSnow, ShieldCheck, ThermometerSnowflake } from "lucide-react";

interface AgeOfIceProps {
  days: number; // Nombre de jours que vit votre argent avant d'être dépensé
}


const AgeOfIce = ({ days }: AgeOfIceProps) => {
  // 1. Détermination de l'état de l'iceberg visuellement selon le nombre de jours
  let icebergStatus = {
    title: "Glace très mince (Situation critique)",
    desc: "Votre argent fond rapidement comme de la neige au soleil ! Essayez d'épargner et évitez les dépenses impulsives.",
    color: "from-blue-200 to-cyan-300 border-cyan-200 text-cyan-800",
    iconSize: "scale-75 opacity-60",
    bgSnow: "opacity-20",
  };

  if (days >= 10 && days < 20) {
    icebergStatus = {
      title: "Glace modérée (Début de stabilité)",
      desc: "Votre argent commence à se consolider, mais le vent reste doux. Continuez à bâtir de solides habitudes financières.",
      color: "from-blue-300 to-cyan-400 border-cyan-300 text-cyan-900",
      iconSize: "scale-90 opacity-80",
      bgSnow: "opacity-40 animate-pulse",
    };
  } else if (days >= 20 && days < 30) {
    icebergStatus = {
      title: "Iceberg solide (Sécurité financière moyenne)",
      desc: "Super ! Votre argent vit depuis plus de 20 jours. Vous imitez la résilience de l'ours polaire en hiver.",
      color: "from-blue-400 to-sky-500 border-sky-400 text-blue-950",
      iconSize: "scale-105 opacity-95",
      bgSnow: "opacity-60",
    };
  } else if (days >= 30) {
    icebergStatus = {
      title: "Iceberg géant (Sécurité financière absolue !)",
      desc: "Incroyable ! Vous dépensez maintenant de l'argent gagné il y a plus d'un mois. Votre protection est aussi solide que les glaciers de l'Arctique.",
      color: "from-sky-500 to-blue-700 border-blue-500 text-white",
      iconSize: "scale-125 opacity-100 filter drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]",
      bgSnow: "opacity-100",
    };
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-md transition-all duration-500 ${icebergStatus.color}`}>
      {/* Effet esthétique de tempête de neige en arrière-plan */}
      <div className={`absolute inset-0 pointer-events-none flex justify-around items-center ${icebergStatus.bgSnow}`}>
        <CloudSnow className="w-5 h-5 animate-bounce delay-100" />
        <CloudSnow className="w-4 h-4 animate-bounce delay-300" />
        <CloudSnow className="w-6 h-6 animate-bounce delay-700" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Section Droite : Informations textuelles */}
        <div className="flex flex-col gap-2 max-w-lg text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              Indice d'Âge de la Glace 🧊
            </span>
          </div>
          <h3 className="text-xl font-extrabold">{icebergStatus.title}</h3>
          <p className="text-sm opacity-90 leading-relaxed">{icebergStatus.desc}</p>
        </div>

        {/* Section Gauche : Compteur visuel et icône interactive */}
        <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-inner">
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-xs opacity-85">Âge de votre argent</span>
            <span className="text-4xl font-black tracking-tight">
              {days} {days === 1 ? "jour" : "jours"}
            </span>
          </div>
          <div className={`transition-all duration-700 ease-out p-3 rounded-full bg-white/20 ${icebergStatus.iconSize}`}>
            {days >= 30 ? (
              <ShieldCheck className="w-12 h-12 text-sky-200" />
            ) : (
              <ThermometerSnowflake className="w-12 h-12 text-blue-100" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeOfIce;
