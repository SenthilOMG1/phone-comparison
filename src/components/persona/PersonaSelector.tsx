import { PersonaType } from '../../types';
import { personasConfig } from '../../config/personas.config';
import { Card } from '../ui';
import { Camera, Gamepad2, Battery, DollarSign } from 'lucide-react';

interface PersonaSelectorProps {
  activePersona: PersonaType;
  onChange: (persona: PersonaType) => void;
}

const iconMap = {
  Camera,
  Gamepad2,
  Battery,
  DollarSign,
};

export function PersonaSelector({ activePersona, onChange }: PersonaSelectorProps) {
  const personas = Object.values(personasConfig.personas);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-neutral-900">Choose Your Persona</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {personas.map((persona) => {
          const Icon = iconMap[persona.icon as keyof typeof iconMap];
          const isActive = activePersona === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => onChange(persona.id)}
              className="text-left"
            >
              <Card
                className={`p-4 transition-all ${
                  isActive
                    ? 'border-2 border-primary-500 bg-primary-50'
                    : 'border-2 border-transparent hover:border-primary-200'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isActive ? 'text-primary-900' : 'text-neutral-900'}`}>
                      {persona.name}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">{persona.description}</p>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
