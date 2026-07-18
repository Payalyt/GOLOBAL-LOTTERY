import React from 'react';
import { Hero } from '../components/Hero';
import { PromoBanner } from '../components/PromoBanner';
import { GameGrid } from '../components/GameGrid';
import { LatestResults } from '../components/LatestResults';
import { Raffles } from '../components/Raffles';
import { WinnersShowcase } from '../components/WinnersShowcase';
import { LatestRaffleResults } from '../components/LatestRaffleResults';
import { TicketUnlockBanner } from '../components/TicketUnlockBanner';
import { Footer } from '../components/Footer';

export function Home() {
  return (
    <>
      <div className="space-y-12 max-w-7xl mx-auto px-4 py-8 overflow-hidden">
        <Hero />
        <PromoBanner />
        <GameGrid />
        <LatestResults />
        <Raffles />
        <WinnersShowcase />
        <LatestRaffleResults />
        <TicketUnlockBanner />
      </div>
      <Footer />
    </>
  );
}
