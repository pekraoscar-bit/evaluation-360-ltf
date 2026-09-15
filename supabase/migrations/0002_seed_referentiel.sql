-- ============================================================
-- SEED: positions (référentiel des postes, depuis l'annuaire Excel)
-- active = false pour les postes sans grille de critères (à compléter par la DRH)
-- ============================================================
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Agent Pesée', false, 1);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Agent Vérificateur', true, 2);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Caisse', true, 3);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Cariste', true, 4);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Dépotage', true, 5);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Gestionnaire Chambre Froide', false, 6);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Gestionnaire de stock', false, 7);
INSERT INTO public.positions (name, active, display_order) VALUES ('Chef d''Équipe Manutennaire', true, 8);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable QHSE', true, 9);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable Transit', true, 10);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable Transport', true, 11);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable des Opérations', true, 12);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable des Ressources Humaines', true, 13);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable des Ventes', false, 14);
INSERT INTO public.positions (name, active, display_order) VALUES ('Responsable financier', true, 15);
INSERT INTO public.positions (name, active, display_order) VALUES ('Superviseur', true, 16);
INSERT INTO public.positions (name, active, display_order) VALUES ('Superviseur General', false, 17);

-- ============================================================
-- SEED: position_criteria (4 critères par poste, texte exact du fichier Excel)
-- NOTE : correspondance poste annuaire -> grille de critères appliquée
-- automatiquement pour les libellés proches (ex. 'Chef d'Équipe Caisse' -> grille
-- 'Chef d'équipe Caissière'). À vérifier avec la DRH, notamment :
--   - 'Responsable financier' rattaché à la grille 'Responsable Comptabilité / Finance' (à confirmer)
--   - 'Chef d'Équipe Agent Vérificateur' rattaché à 'Chef d'équipe Contrôle / Vérification' (à confirmer)
-- ============================================================
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Rigueur et précision dans les contrôles effectués', 1 FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Capacité à détecter et signaler les anomalies', 2 FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Clarté des consignes données à l''équipe', 3 FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des délais de vérification', 4 FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Organisation et planification des opérations de dépotage', 1 FROM public.positions WHERE name = 'Chef d''Équipe Dépotage';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des procédures de sécurité', 2 FROM public.positions WHERE name = 'Chef d''Équipe Dépotage';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Gestion du temps et des priorités', 3 FROM public.positions WHERE name = 'Chef d''Équipe Dépotage';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Communication avec l''équipe et les autres services', 4 FROM public.positions WHERE name = 'Chef d''Équipe Dépotage';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Rigueur dans la gestion des opérations de caisse', 1 FROM public.positions WHERE name = 'Chef d''Équipe Caisse';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des procédures de contrôle financier', 2 FROM public.positions WHERE name = 'Chef d''Équipe Caisse';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Disponibilité et écoute envers l''équipe', 3 FROM public.positions WHERE name = 'Chef d''Équipe Caisse';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Gestion des situations délicates (litiges, erreurs de caisse)', 4 FROM public.positions WHERE name = 'Chef d''Équipe Caisse';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Organisation et répartition du travail', 1 FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des règles de sécurité et de manutention', 2 FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Disponibilité et esprit d''équipe', 3 FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Gestion des délais et de la charge de travail', 4 FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect et application des consignes de sécurité', 1 FROM public.positions WHERE name = 'Chef d''Équipe Cariste';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Organisation et répartition équitable des tâches', 2 FROM public.positions WHERE name = 'Chef d''Équipe Cariste';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Disponibilité et soutien technique à l''équipe', 3 FROM public.positions WHERE name = 'Chef d''Équipe Cariste';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Gestion des délais de manutention', 4 FROM public.positions WHERE name = 'Chef d''Équipe Cariste';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Écoute et disponibilité envers les collaborateurs', 1 FROM public.positions WHERE name = 'Responsable des Ressources Humaines';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Équité et transparence dans la gestion du personnel', 2 FROM public.positions WHERE name = 'Responsable des Ressources Humaines';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Qualité de l''accompagnement (formation, évolution, carrière)', 3 FROM public.positions WHERE name = 'Responsable des Ressources Humaines';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Réactivité dans le traitement des demandes et dossiers administratifs', 4 FROM public.positions WHERE name = 'Responsable des Ressources Humaines';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Maîtrise des procédures douanières et de transit', 1 FROM public.positions WHERE name = 'Responsable Transit';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Réactivité face aux blocages ou situations urgentes', 2 FROM public.positions WHERE name = 'Responsable Transit';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Qualité du suivi et de la communication sur l''avancement des dossiers', 3 FROM public.positions WHERE name = 'Responsable Transit';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des délais de dédouanement / livraison', 4 FROM public.positions WHERE name = 'Responsable Transit';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Rigueur dans l''application des normes de sécurité et d''hygiène', 1 FROM public.positions WHERE name = 'Responsable QHSE';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Qualité de la sensibilisation et de la formation des équipes', 2 FROM public.positions WHERE name = 'Responsable QHSE';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Réactivité en cas d''incident ou de non-conformité', 3 FROM public.positions WHERE name = 'Responsable QHSE';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Suivi et amélioration continue des procédures QHSE', 4 FROM public.positions WHERE name = 'Responsable QHSE';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Qualité de la planification et de l''organisation des tournées', 1 FROM public.positions WHERE name = 'Responsable Transport';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Gestion efficace du parc / de la flotte', 2 FROM public.positions WHERE name = 'Responsable Transport';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Capacité à résoudre rapidement les imprévus logistiques', 3 FROM public.positions WHERE name = 'Responsable Transport';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Clarté de la communication avec les chauffeurs et les équipes terrain', 4 FROM public.positions WHERE name = 'Responsable Transport';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Rigueur et fiabilité dans le suivi comptable et financier', 1 FROM public.positions WHERE name = 'Responsable financier';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Respect des délais (clôtures, paiements, déclarations)', 2 FROM public.positions WHERE name = 'Responsable financier';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Clarté et transparence dans la communication des informations financières', 3 FROM public.positions WHERE name = 'Responsable financier';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Réactivité et disponibilité pour répondre aux besoins des équipes', 4 FROM public.positions WHERE name = 'Responsable financier';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Capacité d''encadrement et de motivation de l''équipe', 1 FROM public.positions WHERE name = 'Superviseur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Suivi rigoureux des activités et des objectifs', 2 FROM public.positions WHERE name = 'Superviseur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Communication claire et régulière', 3 FROM public.positions WHERE name = 'Superviseur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Équité dans la gestion et la résolution des conflits', 4 FROM public.positions WHERE name = 'Superviseur';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Capacité d''organisation et de coordination globale', 1 FROM public.positions WHERE name = 'Responsable des Opérations';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Leadership et gestion des priorités', 2 FROM public.positions WHERE name = 'Responsable des Opérations';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Efficacité dans la résolution des problèmes opérationnels', 3 FROM public.positions WHERE name = 'Responsable des Opérations';
INSERT INTO public.position_criteria (position_id, name, display_order) SELECT id, 'Communication transversale entre les différents services', 4 FROM public.positions WHERE name = 'Responsable des Opérations';

-- ============================================================
-- SEED: sites (PAA, VRIDI — 'PAA ET VRIDI' traité comme rattachement multi-site,
-- simplifié ici au site PAA ; à ajuster si un modèle multi-site par employé est requis)
-- ============================================================
INSERT INTO public.sites (name) VALUES ('PAA'), ('VRIDI');

-- ============================================================
-- SEED: employees (23 titulaires réels du fichier Excel)
-- Étape 1/2 : insertion sans le lien manager (résolu ensuite par matricule)
-- ============================================================
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '25LTF010', 'FATOKOUN MANASSE', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Gestionnaire de stock'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF016', 'ACHO PRISCA FLORENCE', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '25LTF016', 'SONGNE YACOU', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Gestionnaire Chambre Froide'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF021', 'BEDE SIMON PIERRE', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Dépotage'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF011', 'YODA BINTOU', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Caisse'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF067', 'KOUADIO KOUAME RAOUL', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF054', 'KOUIE MAHAN OLIVIER', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Cariste'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '25LTF002', 'TANOBIAN EMILE', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Gestionnaire de stock'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF046', 'BOHOUSSOU AYA NINA', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Agent Vérificateur'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF026', 'KONE DORIANE', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Agent Pesée'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF066', 'GBEUNDE LEONS FRANÇOIS', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Manutennaire'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '24LTF019', 'SOUMARO KADIATOU', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Dépotage'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF060', 'ISSIAKA CHERIF', (SELECT id FROM public.positions WHERE name = 'Chef d''Équipe Gestionnaire Chambre Froide'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF051', 'MADY SABINE', (SELECT id FROM public.positions WHERE name = 'Responsable des Ressources Humaines'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF006', 'FOFANA ANICETTE', (SELECT id FROM public.positions WHERE name = 'Responsable Transit'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '25LTF008', 'DEA ANNABELLE', (SELECT id FROM public.positions WHERE name = 'Responsable QHSE'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF008', 'OUE ZRAN LARISSA', (SELECT id FROM public.positions WHERE name = 'Responsable Transport'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '23LTF039', 'KOUADIO HUBERSON', (SELECT id FROM public.positions WHERE name = 'Responsable financier'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF019', 'MORO N''GUESSAN', (SELECT id FROM public.positions WHERE name = 'Superviseur'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF017', 'N''GORAN KOUAME CESAIRE', (SELECT id FROM public.positions WHERE name = 'Superviseur General'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF010', 'AGATHE AMOIN', (SELECT id FROM public.positions WHERE name = 'Superviseur'), (SELECT id FROM public.sites WHERE name = 'VRIDI');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT '21LTF015', 'TRAORE MAHOMET AMINATA', (SELECT id FROM public.positions WHERE name = 'Responsable des Ventes'), (SELECT id FROM public.sites WHERE name = 'PAA');
INSERT INTO public.employees (matricule, full_name, position_id, site_id) SELECT 'LTF037', 'DOUMBIA HAMED', (SELECT id FROM public.positions WHERE name = 'Responsable des Opérations'), (SELECT id FROM public.sites WHERE name = 'VRIDI');

-- Résolution des liens N+1 par matricule (les N+1 'XXXX' sans matricule restent NULL,
-- voir note ci-dessous)
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '25LTF010';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '21LTF016';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '25LTF016';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '21LTF021';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '23LTF039') WHERE matricule = '21LTF011';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF019') WHERE matricule = '23LTF067';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF019') WHERE matricule = '23LTF054';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '25LTF002';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '23LTF046';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF015') WHERE matricule = '21LTF026';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF017') WHERE matricule = '23LTF066';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = 'LTF037') WHERE matricule = '24LTF019';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF017') WHERE matricule = '23LTF060';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF017') WHERE matricule = '21LTF019';
UPDATE public.employees SET manager_employee_id = (SELECT id FROM public.employees WHERE matricule = '21LTF017') WHERE matricule = '21LTF010';

-- N+1 cités sans matricule dans le fichier (probablement Comité de Direction,
-- absents de l'annuaire fourni) : DAGO JEAN VINCENT, GUI DIBO EMMA, SISSOKO MAÏMOUNA
-- Leur lien manager_employee_id reste NULL tant qu'ils ne sont pas ajoutés comme
-- employés (à faire une fois confirmé par la DRH).