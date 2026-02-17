# Guide d'intégration du QR Code Wave

Voici les étapes à suivre pour mettre à jour ou remplacer le QR Code de paiement Wave par un nouveau compte réel.

## 1. Préparation de l'image
1.  Ouvrez l'application **Wave** sur votre téléphone.
2.  Accédez à votre QR Code (généralement dans "Ma carte" ou "Paiements").
3.  Prenez une **capture d'écran**.
4.  **Important** : Découpez l'image pour qu'il ne reste **que le carré blanc du QR Code**. Ne laissez pas la barre d'état du téléphone ou les boutons de l'application Wave autour.
5.  Enregistrez l'image sous le nom `wave-qr-code.png`.

## 2. Remplacement du fichier
1.  Allez dans le dossier du projet : `src/assets/`.
2.  Remplacez le fichier `wave-qr-code.png` existant par votre nouvelle image.

## 3. Mise à jour des informations textuelles
Si le nom du titulaire ou le numéro change, vous devez modifier deux fichiers :

### Fichier `src/pages/Payments.tsx`
Recherchez le bloc contenant "Daouda fickou" (vers la ligne 477) et remplacez-le :
```tsx
<span>Wave : [NOUVEAU NOM]</span>
...
envoyez au <strong>[NOUVEAU NUMÉRO]</strong>
```

### Fichier `src/components/WavePayment.tsx`
Recherchez le bloc de texte (vers la ligne 134) et mettez à jour les informations :
```tsx
<p className="text-sm font-medium text-navy">
    Compte : <span className="font-bold">[NOUVEAU NOM]</span>
</p>
<p className="text-sm font-medium text-navy">
    Numéro : <span className="font-bold">[NOUVEAU NUMÉRO]</span>
</p>
```

## 4. Déploiement
Une fois les fichiers modifiés :
1.  Lancez la commande de build : `npm run build`.
2.  Transférez le contenu du dossier `dist/` sur votre hébergement web.
