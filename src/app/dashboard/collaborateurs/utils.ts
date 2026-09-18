/** Adresse e-mail générée à partir du matricule — fiable et unique,
 * contrairement à un slug de nom (accents, homonymes). Modifiable par la DRH. */
export function emailFromMatricule(matricule: string): string {
  return `${matricule.toLowerCase().replace(/[^a-z0-9]/g, "")}@latulipefood.ci`;
}
