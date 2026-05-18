import dayjs from 'dayjs';
import ical, { ICalEventBusyStatus } from 'ical-generator';
import { getAlarmDays, getFirstMondays } from 'luchtalarm/dayjs';
import fs from 'node:fs';


const currentYear = dayjs().year();
const years = [currentYear, currentYear + 1];

const calendar = ical({
    name: years.length > 1
        ? `Luchtalarm ${years.at(0)}-${years.at(-1)}`
        : `Luchtalarm ${years.at(0)}`,
});

for (const year of years) {
    const alarmDays = Array.from(getAlarmDays(year));

    for (const date of getFirstMondays(year)) {
        const start = date;
        const end = date;

        if (!alarmDays.some((day) => day.isSame(date, 'day'))) {
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
