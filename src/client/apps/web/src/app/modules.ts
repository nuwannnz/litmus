import type { AppModule } from '@litmus/core';
import { weekModule } from '@litmus/week';
import { projectsModule } from '@litmus/projects';
import { notesModule } from '@litmus/notes';

/**
 * The feature modules this app ships. Rail order and the `1`/`2`/`3` shortcuts
 * follow this list. Lifting a module into its own Nx app means dropping it here
 * and pointing the new app at the same library.
 */
export const APP_MODULES: AppModule[] = [weekModule, projectsModule, notesModule];
