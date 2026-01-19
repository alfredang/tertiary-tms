import React from 'react';
import { useLms } from '../hooks/useLms';
import { Card } from './common/Card';
import { Icon, IconName } from './common/Icon';
import { CalendarEvent } from '../types';

const CalendarView: React.FC = () => {
  const { calendarEvents } = useLms();

  const getIconForType = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'quiz':
        return <Icon name={IconName.Create} className="w-5 h-5 text-blue-500" />;
      case 'assignment':
        return <Icon name={IconName.Courses} className="w-5 h-5 text-purple-500" />;
      case 'lecture':
        return <Icon name={IconName.Profile} className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Task List</h2>
      <Card className="p-6">
        <div className="space-y-4">
          {calendarEvents.length > 0 ? (
            calendarEvents.map(event => (
              <div key={event.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-3 rounded-full bg-white mr-4 shadow-sm">
                  {getIconForType(event.type)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{event.title}</p>
                  <p className="text-sm text-subtle capitalize">{event.type}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-subtle py-4">No upcoming events.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CalendarView;