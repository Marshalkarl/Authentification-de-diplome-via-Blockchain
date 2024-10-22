// migrations/8_setup_dependencies.js

const Gestion_Institution = artifacts.require("Gestion_Institution");
const Gestion_Etudiant = artifacts.require("Gestion_Etudiant");
const Gestion_Permission = artifacts.require("Gestion_Permission");
const Creation = artifacts.require("Creation");
const Verification = artifacts.require("Verification");
const Gestion_Transaction = artifacts.require("Gestion_Transaction");

module.exports = async function (deployer) {
  // Déploiement des adresses de base
  const gestionInstitutionInstance = await Gestion_Institution.deployed();
  const gestionEtudiantInstance = await Gestion_Etudiant.deployed();
  const gestionPermissionInstance = await Gestion_Permission.deployed();
  const creationInstance = await Creation.deployed();
  const verificationInstance = await Verification.deployed();
  const gestionTransactionInstance = await Gestion_Transaction.deployed();

  // Configuration des permissions
  // Ex : On assigne la permission "INSTITUTION" à l'adresse de Gestion_Institution
  await gestionPermissionInstance.grantPermission(gestionInstitutionInstance.address, "INSTITUTION");

  // Configuration des dépendances dans Creation
  // Ex : on ajoute la vérification des institutions dans Creation
  await creationInstance.setGestionInstitutionAddress(gestionInstitutionInstance.address);

  // Configuration de Verification pour qu'il puisse vérifier les diplômes créés
  await verificationInstance.setCreationContractAddress(creationInstance.address);

  // Configuration des Transactions pour enregistrer les interactions avec Creation et Verification
  await gestionTransactionInstance.setCreationContractAddress(creationInstance.address);
  await gestionTransactionInstance.setVerificationContractAddress(verificationInstance.address);

  console.log("Dépendances configurées avec succès !");
};
