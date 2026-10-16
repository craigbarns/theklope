-- Corrections de fiches (audit du 16/10/2026). Fichier 100 % ASCII.
-- 1. Mangue Passion 50 ml - Fruizee Max reprenait le texte de Fruits Rouges Yuzu.
-- 2. Armour Octa - Vaporesso : faute "Vous aller kiffer".
-- Sweet Dragon 50 ml (Vape of Legends) reprend aussi le texte de Blue Coon-Fu,
-- mais sa vraie recette est a saisir dans l'admin : rien n'est invente ici.
-- Le resultat affiche le debut des deux descriptions corrigees.

update public.products
set short = replace(short, 'fruits rouges et yuzu', 'mangue et fruit de la passion'),
    long = replace(long, 'fruits rouges et yuzu', 'mangue et fruit de la passion')
where id = 'mangue-passion-50-ml-fruizee-max';

update public.products
set short = replace(short, 'Vous aller kiffer', 'Vous allez adorer'),
    long = replace(long, 'Vous aller kiffer', 'Vous allez adorer')
where id = 'armour-octa-vaporesso';

select id, name, left(short, 160) as debut_description
from public.products
where id in ('mangue-passion-50-ml-fruizee-max', 'armour-octa-vaporesso');
