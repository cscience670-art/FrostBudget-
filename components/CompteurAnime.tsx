'use client';
import CountUp from 'react-countup';

interface CompteurAnimeProps {
  montant: number;
  className?: string; 
}

const CompteurAnime = ({ montant, className = '' }: CompteurAnimeProps) => {
  return (
    <div className={`w-full ${className}`}>
      <CountUp
        duration={1}
        decimals={2}
        decimal=","
        prefix="$"
        end={montant}
      />
    </div>
  );
};

export default CompteurAnime;
