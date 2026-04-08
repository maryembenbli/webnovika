import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";

const steps = [
  {
    title: "Commande recue",
    text: "Les commandes creees depuis la fiche produit arrivent dans le backend NestJS.",
  },
  {
    title: "Traitement admin",
    text: "Le dashboard mobile peut maintenant afficher la liste et le detail des commandes.",
  },
  {
    title: "Suivi centralise",
    text: "Le meme systeme de couleurs et de cartes est applique a cette page pour garder une UI coherente.",
  },
];

export default function Cart() {
  return (
    <AppShell title="Novika Shop" subtitle="Suivi des commandes">
      <main className="container pageSection">
        <section className="surface cartSurface">
          <div className="sectionHead sectionHeadStack">
            <div>
              <h1 className="sectionTitle">Espace commandes</h1>
              <div className="sectionMeta">Page ajoutee pour eviter une navigation morte depuis le header.</div>
            </div>
            <Link to="/" className="ghostBtn linkAsButton">
              Retour boutique
            </Link>
          </div>

          <div className="featureGrid">
            {steps.map((step) => (
              <article key={step.title} className="featureCard">
                <div className="pill">{step.title}</div>
                <p className="pdText">{step.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
