class Data {

    // ratios 
    // (koliko je nekaj veliko glede na navidezno oddaljenost tega nečesa; 
    // izraženo v deležu velikosti tega nečesa, ko je ta najbliže gledalcu);
    
    // pridobljeno z atangensno funkcijo (naraščanje vidnega kota s približevanjem predmeta)
    // for (let i = 11; i >= 0.82; i -= 0.05) {
    //     currRratio = 2*Math.atan2(0.5, i) - 0.05;
    //     funkcija, ki posnema spreminjanje vidnega kota odvisno od oddaljenosti objekta (oddaljenost je i; 0,5 pomeni velikost objekta, ki je enaka 1, deljeno z dva, ker taka je ta formula)
    //     da vrednosti od 0,04 do 0,096, kar se potem množi z r-jem; 0,05 je korekcija, ker zadeva dosti časa gravitira okoli 0,01, kar pa naredi prevelik krog na ekranu;
    // korekcije v resnici ne sme bit, ker če ne je tunel ukrivljen, ko zaviješ, kot da gre v lep ovinek
    // pazi, da zadnji ni večji od 1, ker to pač nima veze (tudi če ga nariše, ni viden, zahteva pa CPU);
    // mora biti najmanj na 4 decimalke, sicer pleše sem in tja;


    // ZA PROGRAMATIČNO RABO
    //  - - NE POZABI DAT numLenghts na toliko, kot je let i = x pri for zanki izračuna  - - 
    static ratios = [];

    static numRatios = 0;
    static numRings = 10;    // kolko obročev bo predvidoma vidnih naenkrat na ekranu;
    static stepsInIntrvl = 0;
    static numLengths = 20;    // koliko enotskih dolžin obsega array ratios; hardcoded jih 11, oz, vsaj štarta z 11
    static stepsPerUnit = 0;    // kolko ratiov obsega ena abstraktna dolžinska enota (teoretično enaka 2r ...);
    static shareOf1StepIn1Unit = 0; // 1/(Math.floor(Data.numRatios/Data.numLengths)) ; torej kolikšen del ene enote obsega en korak;
    static lightRingColor = '#ffffff';
    static prominentRingColor = '#30eefc'; // #ff893a - oranžna; #2ef82e - fluorescentno zelena; #30eefc - modra;
    static bckgndColor = '#313131';
    


}