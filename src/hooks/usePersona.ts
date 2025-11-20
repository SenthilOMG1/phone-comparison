import { PersonaType } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { personasConfig } from '../config/personas.config';

export function usePersona() {
  const [activePersona, setActivePersona] = useLocalStorage<PersonaType>(
    'active_persona',
    personasConfig.default
  );

  const persona = personasConfig.personas[activePersona];

  return {
    activePersona,
    setActivePersona,
    persona,
    allPersonas: personasConfig.personas,
  };
}
