// ↓ Добавь это в конец файла ↓
import dataSource from '../data-source';
import { Section } from '../../sections/section.entity';

(async () => {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        const rep = dataSource.getRepository(Section);
        await rep.insert([
            {
                name: 'Вольная борьба',
                sport: 'Борьба',
                description: 'Секция по вольной борьбе для начинающих и опытных спортсменов. Развиваем силу, ловкость и стратегическое мышление.',
                location: 'ГК',
                schedule: [
                    { dayOfWeek: 0, timeStart: '09:00', timeEnd: '11:00' },
                    { dayOfWeek: 2, timeStart: '09:00', timeEnd: '11:00' },
                    { dayOfWeek: 4, timeStart: '09:00', timeEnd: '11:00' },
                ],
                maxParticipants: 20,
                ageMin: 10,
                ageMax: 18,
                price: 5000,
                isActive: true,
            },
            {
                name: 'Греко-римская борьба',
                sport: 'Борьба',
                description: 'Классическая борьба. Техника, дисциплина, командный дух. Подготовка к региональным соревнованиям.',
                location: 'ГК',
                schedule: [
                    { dayOfWeek: 1, timeStart: '14:00', timeEnd: '16:00' },
                    { dayOfWeek: 3, timeStart: '14:00', timeEnd: '16:00' },
                    { dayOfWeek: 5, timeStart: '10:00', timeEnd: '12:00' },
                ],
                maxParticipants: 15,
                ageMin: 12,
                ageMax: 25,
                price: 4500,
                isActive: true,
            },
            {
                name: 'Бокс',
                sport: 'Бокс',
                description: 'Профессиональная подготовка боксёров. Работа с тренером, спарринги, общефизическая подготовка.',
                location: 'ГК',
                schedule: [
                    { dayOfWeek: 0, timeStart: '17:00', timeEnd: '19:00' },
                    { dayOfWeek: 2, timeStart: '17:00', timeEnd: '19:00' },
                    { dayOfWeek: 4, timeStart: '17:00', timeEnd: '19:00' },
                ],
                maxParticipants: 12,
                ageMin: 14,
                ageMax: 20,
                price: 6000,
                isActive: true,
            },
            {
                name: 'Плавание (продвинутый)',
                sport: 'Плавание',
                description: 'Секция для опытных пловцов. Совершенствование техники всех стилей плавания, подготовка к соревнованиям.',
                location: 'ГК',
                schedule: [
                    { dayOfWeek: 1, timeStart: '07:00', timeEnd: '09:00' },
                    { dayOfWeek: 3, timeStart: '07:00', timeEnd: '09:00' },
                    { dayOfWeek: 5, timeStart: '07:00', timeEnd: '09:00' },
                ],
                maxParticipants: 10,
                ageMin: 8,
                ageMax: 16,
                price: 8000,
                isActive: true,
            },
            {
                name: 'Лёгкая атлетика',
                sport: 'Лёгкая атлетика',
                description: 'Бег, прыжки, метания. Развитие выносливости и скоростных качеств. Участие в городских соревнованиях.',
                location: 'ГК',
                schedule: [
                    { dayOfWeek: 0, timeStart: '08:00', timeEnd: '10:00' },
                    { dayOfWeek: 2, timeStart: '08:00', timeEnd: '10:00' },
                    { dayOfWeek: 6, timeStart: '09:00', timeEnd: '11:00' },
                ],
                maxParticipants: 25,
                ageMin: 10,
                ageMax: 18,
                price: 5500,
                isActive: true,
            },
        ]);

        console.log('✅ Вставлено:', await rep.count());
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();