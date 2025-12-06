import dayjs from 'dayjs';
import ical, { ICalEventBusyStatus } from 'ical-generator';
import fs from 'node:fs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/timezone.js';
import { gregorianEaster } from 'date-easter'

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(timezone);

const currentYear = dayjs().year();
const years = [currentYear, currentYear + 1];

const calendar = ical({
    name: years.length > 1
        ? `Luchtalarm ${years.at(0)}-${years.at(-1)}`
        : `Luchtalarm ${years.at(0)}`,
});

for (const year of years) {
    const easter = gregorianEaster(year);

    // We only care about mondays so only second easter day is important here
    const secondEasterDay = dayjs(`${easter.year}-${easter.month}-${easter.day}`).add(1, 'day');

    const skipped = [
        `1-1-${year}`, // Nieuwjaarsdag
        secondEasterDay.format('D-M-YYYY'), // Tweede paasdag
        `27-4-${year}`, // Koningsdag
        `4-5-${year}`, // Herdenking
        `5-5-${year}`, // Bevrijdingsdag
        secondEasterDay.add(7, 'weeks').format('D-M-YYYY'), // Tweede pinksterdag
    ];

    for (let month = 0; month < 12; month++) {
        let date = dayjs().year(year).month(month).startOf('month');

        while (date.isoWeekday() !== 1) {
            date = date.add(1, "day");
        }

        const start = date;
        const end = date;

        if (skipped.includes(date.format('D-M-YYYY'))) {
            console.log(`Skipping ${date.format('dddd D MMMM YYYY')}`);

            calendar.createEvent({
                allDay: true,
                start: start.toDate(),
                end: end.toDate(),
                summary: 'GEEN luchtalarm',
                description: 'Vandaag wordt het luchtalarm NIET getest i.v.m. een bijzondere dag.',
                url: 'https://www.rijksoverheid.nl/onderwerpen/veiligheidsregios-en-crisisbeheersing/vraag-en-antwoord/wanneer-wordt-de-sirene-getest',
                busystatus: ICalEventBusyStatus.FREE,
            });

            continue;
        }

        console.log(`Adding event for ${date.format('dddd D MMMM YYYY')}`);

        calendar.createEvent({
            allDay: true,
            start: start.toDate(),
            end: end.toDate(),
            summary: 'Luchtalarm',
            description: 'Het luchtalarm zal vandaag om 12:00 getest worden.',
            url: 'https://www.rijksoverheid.nl/onderwerpen/veiligheidsregios-en-crisisbeheersing/vraag-en-antwoord/wanneer-wordt-de-sirene-getest',
            busystatus: ICalEventBusyStatus.FREE,
        });
    }
}

fs.mkdir('build', () => { });
fs.writeFile('build/calendar.ics', calendar.toString(), () => { });
