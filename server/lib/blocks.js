/**
 * Definition of every editable "content block" per public page.
 * type: text | textarea | richtext | list
 * List blocks store a JSON array of fixed length (the layout is a fixed CSS
 * grid, so items can be edited but not added/removed from the back office).
 */
const PAGES = {
  home: {
    label: 'Accueil',
    blocks: [
      { key: 'hero_eyebrow', label: 'Bandeau (au-dessus du titre)', type: 'text' },
      { key: 'hero_title_line1', label: 'Titre — ligne 1', type: 'text' },
      { key: 'hero_title_line2_html', label: 'Titre — ligne 2 (HTML autorisé, ex: <em>mot</em>)', type: 'richtext' },
      { key: 'hero_lead', label: 'Texte d’introduction (hero)', type: 'textarea' },
      { key: 'hero_cta_primary', label: 'Bouton principal — texte', type: 'text' },
      { key: 'hero_cta_secondary', label: 'Bouton secondaire — texte', type: 'text' },
      {
        key: 'hero_stats', label: 'Chiffres clés (bandeau du haut)', type: 'list', fixedCount: 4,
        itemFields: [
          { name: 'num', label: 'Nombre', type: 'text' },
          { name: 'suffix', label: 'Suffixe (+, %, vide)', type: 'text' },
          { name: 'label', label: 'Légende', type: 'text' },
        ],
      },
      { key: 'about_kicker', label: 'Section "Qui sommes-nous" — mot-clé', type: 'text' },
      { key: 'about_title_html', label: 'Section "Qui sommes-nous" — titre (HTML autorisé)', type: 'richtext' },
      { key: 'about_text_1', label: 'Paragraphe 1', type: 'richtext' },
      { key: 'about_text_2', label: 'Paragraphe 2', type: 'richtext' },
      { key: 'about_quote', label: 'Citation du dirigeant', type: 'textarea' },
      { key: 'about_quote_author', label: 'Nom du dirigeant', type: 'text' },
      { key: 'about_quote_role', label: 'Fonction du dirigeant', type: 'text' },
      { key: 'about_photo_stat_num', label: 'Chiffre sur la photo (ex: +12)', type: 'text' },
      { key: 'about_photo_stat_label', label: 'Légende du chiffre sur la photo', type: 'text' },
      {
        key: 'pillars', label: 'Nos principes fondateurs (4 piliers)', type: 'list', fixedCount: 4,
        itemFields: [
          { name: 'letter', label: 'Lettre', type: 'text' },
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'text', label: 'Texte', type: 'textarea' },
        ],
      },
      { key: 'activities_kicker', label: 'Section "Nos activités" — mot-clé', type: 'text' },
      { key: 'activities_title_html', label: 'Section "Nos activités" — titre (HTML autorisé)', type: 'richtext' },
      { key: 'activities_tagline', label: 'Accroche', type: 'text' },
      { key: 'activities_desc', label: 'Texte de présentation', type: 'textarea' },
      {
        key: 'activities', label: 'Cartes "Nos activités" (5)', type: 'list', fixedCount: 5,
        itemFields: [
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'text', label: 'Texte', type: 'textarea' },
        ],
      },
      { key: 'realisations_kicker', label: 'Section "Réalisations" — mot-clé', type: 'text' },
      { key: 'realisations_title_html', label: 'Section "Réalisations" — titre (HTML autorisé)', type: 'richtext' },
      { key: 'realisations_desc', label: 'Texte de présentation', type: 'textarea' },
      {
        key: 'realisations_stats', label: 'Chiffres clés — Réalisations (4)', type: 'list', fixedCount: 4,
        itemFields: [
          { name: 'num', label: 'Nombre', type: 'text' },
          { name: 'suffix', label: 'Suffixe (+, %, vide)', type: 'text' },
          { name: 'label', label: 'Légende', type: 'text' },
        ],
      },
      { key: 'contact_kicker', label: 'Section "Contact" — mot-clé', type: 'text' },
      { key: 'contact_title_html', label: 'Section "Contact" — titre (HTML autorisé)', type: 'richtext' },
      { key: 'contact_desc', label: 'Texte de présentation', type: 'textarea' },
      { key: 'footer_tagline', label: 'Slogan dans le pied de page', type: 'text' },
    ],
  },

  formation: {
    label: 'Formations (intro)',
    blocks: [
      { key: 'hero_lead', label: 'Texte d’introduction (hero)', type: 'textarea' },
    ],
  },

  about: {
    label: 'Qui sommes-nous',
    blocks: [
      { key: 'hero_title_html', label: 'Titre (HTML autorisé)', type: 'richtext' },
      { key: 'hero_quote', label: 'Citation', type: 'textarea' },
      { key: 'hero_quote_author', label: 'Nom du dirigeant', type: 'text' },
      { key: 'hero_quote_role', label: 'Fonction du dirigeant', type: 'text' },
      {
        key: 'mva', label: 'Mission / Vision / Ambition', type: 'list', fixedCount: 3,
        itemFields: [
          { name: 'tag', label: 'Étiquette', type: 'text' },
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'text', label: 'Texte', type: 'textarea' },
        ],
      },
      { key: 'histoire_kicker', label: 'Section "Notre histoire" — mot-clé', type: 'text' },
      { key: 'histoire_title_html', label: 'Section "Notre histoire" — titre (HTML autorisé)', type: 'richtext' },
      { key: 'histoire_desc', label: 'Texte de présentation', type: 'textarea' },
      { key: 'histoire_badge_num', label: 'Chiffre sur la photo (ex: +12)', type: 'text' },
      { key: 'histoire_badge_label', label: 'Légende du chiffre sur la photo', type: 'text' },
      {
        key: 'valeurs', label: 'Valeurs R.I.R.E (4)', type: 'list', fixedCount: 4,
        itemFields: [
          { name: 'letter', label: 'Lettre', type: 'text' },
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'text', label: 'Texte', type: 'textarea' },
        ],
      },
      {
        key: 'stats', label: 'Chiffres clés (4)', type: 'list', fixedCount: 4,
        itemFields: [
          { name: 'num', label: 'Nombre', type: 'text' },
          { name: 'suffix', label: 'Suffixe (+, %, vide)', type: 'text' },
          { name: 'label', label: 'Légende', type: 'text' },
        ],
      },
      { key: 'cta_title_html', label: 'Titre de l’appel à l’action final (HTML autorisé)', type: 'richtext' },
      { key: 'cta_text', label: 'Texte de l’appel à l’action final', type: 'textarea' },
    ],
  },

  contact: {
    label: 'Contact',
    blocks: [
      { key: 'hero_title_html', label: 'Titre (HTML autorisé)', type: 'richtext' },
      { key: 'hero_lead', label: 'Texte d’introduction', type: 'textarea' },
      { key: 'topics', label: 'Sujets fréquents (une valeur par ligne)', type: 'textarea', isLines: true },
      {
        key: 'needs', label: 'Ce que cherchent nos clients (5)', type: 'list', fixedCount: 5,
        itemFields: [
          { name: 'title', label: 'Titre', type: 'text' },
          { name: 'text', label: 'Texte', type: 'textarea' },
        ],
      },
    ],
  },
};

module.exports = { PAGES };
