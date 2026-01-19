import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { Card } from './common/Card';
import { Icon, IconName } from './common/Icon';
import { Button } from './common/Button';

interface EventCardProps {
    event: CalendarEvent;
}

const CountdownTimer: React.FC<{ date: string }> = ({ date }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(date) - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    return (
        <div className="flex items-center space-x-2 text-xs font-mono bg-gray-800 text-white px-3 py-1.5 rounded-md">
            <Icon name={IconName.Clock} className="w-4 h-4" />
            <span>{formatTime(timeLeft.days)}<span className="text-gray-400">d</span></span>
            <span>{formatTime(timeLeft.hours)}<span className="text-gray-400">h</span></span>
            <span>{formatTime(timeLeft.minutes)}<span className="text-gray-400">m</span></span>
            <span>{formatTime(timeLeft.seconds)}<span className="text-gray-400">s</span></span>
        </div>
    );
};


const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const eventDate = new Date(event.date);
    const time = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <Card className="flex flex-col h-full">
            <div className="relative">
                <img src={`https://i.pravatar.cc/300?img=${event.id + 10}`} alt={event.speaker} className="w-full h-40 object-cover object-top rounded-t-xl" />
                <div className="absolute top-0 left-0 bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-tl-xl" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)'}}>
                    {event.eventType}
                </div>
                 <div className="absolute bottom-2 right-2">
                    <CountdownTimer date={event.date} />
                 </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-on-surface mb-1 flex-grow">{event.title}</h3>
                <p className="text-sm text-subtle mb-3">By {event.speaker}</p>
                 <div className="flex items-center text-sm text-subtle space-x-4">
                    <span className="flex items-center"><Icon name={IconName.Clock} className="w-4 h-4 mr-1.5"/> {time}</span>
                    <span className="flex items-center"><Icon name={IconName.Calendar} className="w-4 h-4 mr-1.5"/> {date}</span>
                 </div>
                 <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-on-surface text-sm">Book your seat</span>
                    <button className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
            </div>
        </Card>
    )
}

export default EventCard;