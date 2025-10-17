// Brede Welkaart - Translations (NL/EN)

const translations = {
    nl: {
        // Main title
        title: "Brede Welkaart",
        
        // Prototype warning
        prototypeTitle: "Gesloten Prototype",
        prototypeText: "Verzoek deze webpagina niet te delen.",
        prototypeRelease: "Publieke release: februari 2026",
        
        // Capital types
        capitalHeading: "Kapitaal",
        capitalTotal: "Totaal",
        capitalHuman: "Menselijk Kapitaal",
        capitalProduced: "Geproduceerd Kapitaal",
        capitalNatural: "Natuurlijk Kapitaal",
        capitalBalance: "Balans",
        
        // Admin levels
        levelHeading: "Niveau",
        levelPixel: "Pixel (100x100m)",
        levelWijk: "Wijk",
        levelGemeente: "Gemeente",
        levelProvincie: "Provincie",
        
        // Scale options
        scaleHeading: "Schaal",
        scaleAbsolute: "Absoluut",
        scalePerCapita: "Per Inwoner",
        scalePerHectare: "Per Hectare",
        scaleProportion: "Aandeel (%)",
        scaleVsNational: "T.o.v. NL Gemiddelde",
        
        // Tooltips - Total
        tooltipTotalTitle: "Totaal Kapitaal",
        tooltipTotalText: "Som van natuurlijk, geproduceerd en menselijk kapitaal.",
        tooltipTotalCalc: "Berekening:",
        tooltipTotalFormula: "NC + PC + HC",
        tooltipLink: "→ Methodologie",
        
        // Tooltips - Balance
        tooltipBalanceTitle: "Balans",
        tooltipBalanceText: "Toont hoe evenwichtig een regio presteert over alle kapitaalvormen.",
        tooltipBalanceCalc: "Berekening:",
        tooltipBalanceFormula: "Telt hoeveel kapitaalsoorten (per hectare) boven landelijk gemiddelde liggen.",
        tooltipBalanceLegend1: "🟢 Donkergroen = alle 3 boven gemiddelde",
        tooltipBalanceLegend2: "🟢 Lichtgroen = 1-2 boven gemiddelde",
        tooltipBalanceLegend3: "🟡 Geel = evenwichtig (±5%)",
        tooltipBalanceLegend4: "🔴 Lichtrood = 1-2 onder gemiddelde",
        tooltipBalanceLegend5: "🔴 Donkerrood = alle 3 onder gemiddelde",
        
        // Tooltips - Natural
        tooltipNaturalTitle: "Natuurlijk Kapitaal",
        tooltipNaturalText: "Waarde van ecosysteemdiensten en natuurlijke hulpbronnen.",
        tooltipNaturalSource: "Bron:",
        tooltipNaturalSourceText: "CBS Natuurlijk Kapitaalrekeningen (2020), aangepast naar 2023 prijzen (CPI).",
        
        // Tooltips - Produced
        tooltipProducedTitle: "Geproduceerd Kapitaal",
        tooltipProducedText: "Waarde van gebouwen, infrastructuur en andere fysieke activa.",
        tooltipProducedSource: "Bron:",
        tooltipProducedSourceText: "World Bank Wealth Accounts (nationaal totaal).",
        tooltipProducedMethod: "Verdeling:",
        tooltipProducedMethodText: "Twee-staps – CBS BBP naar COROP, LitPop binnen COROP (nachtlicht × bevolking).",
        
        // Tooltips - Human
        tooltipHumanTitle: "Menselijk Kapitaal",
        tooltipHumanText: "Netto contante waarde van toekomstige arbeidsinkomen.",
        tooltipHumanSource: "Bron:",
        tooltipHumanSourceText: "CBS Kerncijfers Wijken en Buurten (inkomen, scholing, arbeidsparticipatie).",
        tooltipHumanMethod: "Methode:",
        tooltipHumanMethodText: "UNEP IWI 2023 shadow price met leeftijdscorrectie (NPV, discontovoet 1.5%).",
        
        // Tooltips - vs National scale
        tooltipVsNationalTitle: "T.o.v. NL Gemiddelde",
        tooltipVsNationalText: "Toont hoe een regio afwijkt van het landelijk gemiddelde.",
        tooltipVsNationalNorm: "Normalisatie:",
        tooltipVsNationalNormText: "Gebruikt kapitaal per hectare voor eerlijke vergelijking tussen grote en kleine regio's.",
        tooltipVsNationalLegend: "🔴 Rood = onder gemiddelde | 🟡 Geel = gemiddeld (±5%) | 🟢 Groen = boven gemiddelde",
        
        // Sidebar links
        linkMethodology: "Methodologie",
        linkAbout: "Over",
        
        // Legend
        legendLow: "Laag",
        legendMedium: "Gemiddeld",
        legendHigh: "Hoog",
        legendBalanceAllBelow: "Alle 3 onder gemiddelde",
        legendBalance12Below: "1-2 onder gemiddelde",
        legendBalanceBalanced: "Evenwichtig",
        legendBalance12Above: "1-2 boven gemiddelde",
        legendBalanceAllAbove: "Alle 3 boven gemiddelde",
        legendVsNationalBelow: "Onder gemiddelde",
        legendVsNationalAverage: "Gemiddeld",
        legendVsNationalAbove: "Boven gemiddelde",
        
        // Info panel - default
        infoPanelTitle: "Over deze kaart",
        infoPanelIntro: "De Brede Welkaart biedt een uitgebreid overzicht van het kapitaal in Nederland. Ontdek de verdeling van natuurlijk, geproduceerd en menselijk kapitaal in verschillende regio's voor het jaar 2023.",
        infoPanelInstruction: "Selecteer een regio",
        infoPanelInstructionText: "op de kaart om gedetailleerde statistieken te bekijken, of gebruik de filters aan de linkerkant om verschillende kapitaalsoorten, niveaus en schalen te verkennen.",
        
        // Info panel - region stats
        infoGemeente: "Gemeente:",
        infoPopulation: "Bevolking",
        infoArea: "Oppervlakte",
        infoCapitalHeading: "Kapitaal (mld. €)",
        infoCapitalHuman: "Menselijk",
        infoCapitalProduced: "Geproduceerd",
        infoCapitalNatural: "Natuurlijk",
        infoCapitalTotal: "Totaal",
        infoPerCapitaHeading: "Per Inwoner (€)",
        infoPerHectareHeading: "Per Hectare (€)",
        infoProportionHeading: "Aandeel (% van totaal)",
        
        // Balance labels
        balanceAllBelow: "Alle 3 onder gemiddelde",
        balance2Below: "2 onder gemiddelde",
        balance1Below: "1 onder gemiddelde",
        balanceBalanced: "Evenwichtig",
        balance1Above: "1 boven gemiddelde",
        balance2Above: "2 boven gemiddelde",
        balanceAllAbove: "Alle 3 boven gemiddelde",
        balanceUnknown: "Onbekend",
        
        // Units
        unitBillion: "mld.",
        unitPerPerson: "p.p.",
        unitPerHectare: "/ha",
        unitPercent: "%",
        unitVsNational: "% t.o.v. NL",
        unitHectares: "ha.",
        
        // Loading
        loading: "Laden...",
        
        // Star marker
        starHighest: "Hoogste waarde:",
        
        // Chart alt text
        chartAlt: "Verdeling kapitaal",
        
        // Back link
        backToMap: "← Terug naar kaart",
        
        // Methodology page
        methodologyTitle: "Methodologie",
        methodologySummaryTitle: "Samenvatting:",
        methodologySummaryText: "De Brede Welkaart visualiseert de verdeling van totaal kapitaal in Nederland voor 2023, opgedeeld in natuurlijk, geproduceerd en menselijk kapitaal. De data is gebaseerd op officiële CBS-statistieken, internationale wetenschappelijke methodieken en ruimtelijke allocatiemodellen.",
        methodologyProjectTitle: "Projectoverzicht",
        methodologyProjectText: "Het Brede Welkaart project brengt de welvaart van Nederland in kaart door niet alleen naar traditionele economische indicatoren te kijken, maar ook naar natuurlijk en menselijk kapitaal. Dit geeft een completer beeld van de brede welvaart van regio's in Nederland.",
        methodologyCapitalTypesTitle: "Kapitaaltypen",
        methodologyNaturalTitle: "Natuurlijk Kapitaal",
        methodologyProducedTitle: "Geproduceerd Kapitaal",
        methodologyHumanTitle: "Menselijk Kapitaal",
        methodologyDistributionTitle: "Ruimtelijke Verdeling",
        methodologyDataSourcesTitle: "Databronnen",
        methodologyLimitationsTitle: "Beperkingen en Nauwkeurigheid",
        methodologyReferencesTitle: "Referenties",
        methodologyOpenDataTitle: "Open Data",
        methodologyOpenDataText: "Alle onderliggende data en scripts worden open beschikbaar gesteld in februari 2026.",
        methodologyLastUpdate: "Laatste update:",
        methodologyContact: "Contact:",
        methodologyContactLink: "Zie de Over pagina",
        
        // About page
        aboutTitle: "Over de Brede Welkaart",
        aboutMissionTitle: "Missie:",
        aboutMissionText: "Het Brede Welkaart project visualiseert de brede welvaart van Nederland door natuurlijk, geproduceerd en menselijk kapitaal in kaart te brengen, om zo een completer beeld te geven dan traditionele economische indicatoren alleen.",
        aboutContextTitle: "Context en Doel",
        aboutTeamTitle: "Project Team",
        aboutPartnersTitle: "Partners",
        aboutFundingTitle: "Funding",
        aboutVersion: "Versie:",
        aboutLastUpdate: "Laatste update:",
        
        // About us link
        aboutUsLink: "Over ons"
    },
    
    en: {
        // Main title
        title: "Brede Welkaart",
        
        // Prototype warning
        prototypeTitle: "Closed Prototype",
        prototypeText: "Please do not share this webpage.",
        prototypeRelease: "Public release: February 2026",
        
        // Capital types
        capitalHeading: "Capital",
        capitalTotal: "Total",
        capitalHuman: "Human Capital",
        capitalProduced: "Produced Capital",
        capitalNatural: "Natural Capital",
        capitalBalance: "Balance",
        
        // Admin levels
        levelHeading: "Level",
        levelPixel: "Pixel (100x100m)",
        levelWijk: "District",
        levelGemeente: "Municipality",
        levelProvincie: "Province",
        
        // Scale options
        scaleHeading: "Scale",
        scaleAbsolute: "Absolute",
        scalePerCapita: "Per Capita",
        scalePerHectare: "Per Hectare",
        scaleProportion: "Share (%)",
        scaleVsNational: "vs. NL Average",
        
        // Tooltips - Total
        tooltipTotalTitle: "Total Capital",
        tooltipTotalText: "Sum of natural, produced and human capital.",
        tooltipTotalCalc: "Calculation:",
        tooltipTotalFormula: "NC + PC + HC",
        tooltipLink: "→ Methodology",
        
        // Tooltips - Balance
        tooltipBalanceTitle: "Balance",
        tooltipBalanceText: "Shows how balanced a region performs across all capital types.",
        tooltipBalanceCalc: "Calculation:",
        tooltipBalanceFormula: "Counts how many capital types (per hectare) are above national average.",
        tooltipBalanceLegend1: "🟢 Dark green = all 3 above average",
        tooltipBalanceLegend2: "🟢 Light green = 1-2 above average",
        tooltipBalanceLegend3: "🟡 Yellow = balanced (±5%)",
        tooltipBalanceLegend4: "🔴 Light red = 1-2 below average",
        tooltipBalanceLegend5: "🔴 Dark red = all 3 below average",
        
        // Tooltips - Natural
        tooltipNaturalTitle: "Natural Capital",
        tooltipNaturalText: "Value of ecosystem services and natural resources.",
        tooltipNaturalSource: "Source:",
        tooltipNaturalSourceText: "CBS Natural Capital Accounts (2020), adjusted to 2023 prices (CPI).",
        
        // Tooltips - Produced
        tooltipProducedTitle: "Produced Capital",
        tooltipProducedText: "Value of buildings, infrastructure and other physical assets.",
        tooltipProducedSource: "Source:",
        tooltipProducedSourceText: "World Bank Wealth Accounts (national total).",
        tooltipProducedMethod: "Distribution:",
        tooltipProducedMethodText: "Two-stage – CBS GDP to COROP, LitPop within COROP (nightlight × population).",
        
        // Tooltips - Human
        tooltipHumanTitle: "Human Capital",
        tooltipHumanText: "Net present value of future labor income.",
        tooltipHumanSource: "Source:",
        tooltipHumanSourceText: "CBS Key Figures Neighborhoods and Districts (income, education, labor participation).",
        tooltipHumanMethod: "Method:",
        tooltipHumanMethodText: "UNEP IWI 2023 shadow price with age correction (NPV, discount rate 1.5%).",
        
        // Tooltips - vs National scale
        tooltipVsNationalTitle: "vs. NL Average",
        tooltipVsNationalText: "Shows how a region deviates from the national average.",
        tooltipVsNationalNorm: "Normalization:",
        tooltipVsNationalNormText: "Uses capital per hectare for fair comparison between large and small regions.",
        tooltipVsNationalLegend: "🔴 Red = below average | 🟡 Yellow = average (±5%) | 🟢 Green = above average",
        
        // Sidebar links
        linkMethodology: "Methodology",
        linkAbout: "About",
        
        // Legend
        legendLow: "Low",
        legendMedium: "Average",
        legendHigh: "High",
        legendBalanceAllBelow: "All 3 below average",
        legendBalance12Below: "1-2 below average",
        legendBalanceBalanced: "Balanced",
        legendBalance12Above: "1-2 above average",
        legendBalanceAllAbove: "All 3 above average",
        legendVsNationalBelow: "Below average",
        legendVsNationalAverage: "Average",
        legendVsNationalAbove: "Above average",
        
        // Info panel - default
        infoPanelTitle: "About this map",
        infoPanelIntro: "The Brede Welkaart provides a comprehensive overview of capital in the Netherlands. Discover the distribution of natural, produced and human capital across different regions for the year 2023.",
        infoPanelInstruction: "Select a region",
        infoPanelInstructionText: "on the map to view detailed statistics, or use the filters on the left to explore different capital types, levels and scales.",
        
        // Info panel - region stats
        infoGemeente: "Municipality:",
        infoPopulation: "Population",
        infoArea: "Area",
        infoCapitalHeading: "Capital (bn. €)",
        infoCapitalHuman: "Human",
        infoCapitalProduced: "Produced",
        infoCapitalNatural: "Natural",
        infoCapitalTotal: "Total",
        infoPerCapitaHeading: "Per Capita (€)",
        infoPerHectareHeading: "Per Hectare (€)",
        infoProportionHeading: "Share (% of total)",
        
        // Balance labels
        balanceAllBelow: "All 3 below average",
        balance2Below: "2 below average",
        balance1Below: "1 below average",
        balanceBalanced: "Balanced",
        balance1Above: "1 above average",
        balance2Above: "2 above average",
        balanceAllAbove: "All 3 above average",
        balanceUnknown: "Unknown",
        
        // Units
        unitBillion: "bn.",
        unitPerPerson: "p.p.",
        unitPerHectare: "/ha",
        unitPercent: "%",
        unitVsNational: "% vs. NL",
        unitHectares: "ha",
        
        // Loading
        loading: "Loading...",
        
        // Star marker
        starHighest: "Highest value:",
        
        // Chart alt text
        chartAlt: "Capital distribution",
        
        // Back link
        backToMap: "← Back to map",
        
        // Methodology page
        methodologyTitle: "Methodology",
        methodologySummaryTitle: "Summary:",
        methodologySummaryText: "The Brede Welkaart visualizes the distribution of total capital in the Netherlands for 2023, divided into natural, produced and human capital. The data is based on official CBS statistics, international scientific methodologies and spatial allocation models.",
        methodologyProjectTitle: "Project Overview",
        methodologyProjectText: "The Brede Welkaart project maps the wealth of the Netherlands by looking not only at traditional economic indicators, but also at natural and human capital. This provides a more complete picture of the broad prosperity of regions in the Netherlands.",
        methodologyCapitalTypesTitle: "Capital Types",
        methodologyNaturalTitle: "Natural Capital",
        methodologyProducedTitle: "Produced Capital",
        methodologyHumanTitle: "Human Capital",
        methodologyDistributionTitle: "Spatial Distribution",
        methodologyDataSourcesTitle: "Data Sources",
        methodologyLimitationsTitle: "Limitations and Accuracy",
        methodologyReferencesTitle: "References",
        methodologyOpenDataTitle: "Open Data",
        methodologyOpenDataText: "All underlying data and scripts will be made openly available in February 2026.",
        methodologyLastUpdate: "Last update:",
        methodologyContact: "Contact:",
        methodologyContactLink: "See the About page",
        
        // About page
        aboutTitle: "About Brede Welkaart",
        aboutMissionTitle: "Mission:",
        aboutMissionText: "The Brede Welkaart project visualizes the broad prosperity of the Netherlands by mapping natural, produced and human capital, providing a more complete picture than traditional economic indicators alone.",
        aboutContextTitle: "Context and Purpose",
        aboutTeamTitle: "Project Team",
        aboutPartnersTitle: "Partners",
        aboutFundingTitle: "Funding",
        aboutVersion: "Version:",
        aboutLastUpdate: "Last update:",
        
        // About us link
        aboutUsLink: "About us"
    }
};

// Helper function to get translation
function t(key, lang = null) {
    const currentLang = lang || currentLanguage || 'nl';
    return translations[currentLang][key] || translations['nl'][key] || key;
}

