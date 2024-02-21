import type { Schema, Attribute } from '@strapi/strapi';

export interface EmployeesContact extends Schema.Component {
  collectionName: 'components_employees_contacts';
  info: {
    displayName: 'Contact';
    description: '';
  };
  attributes: {
    phone: Attribute.String;
    IP: Attribute.String;
    ipPhone: Attribute.String;
    room: Attribute.Relation<
      'employees.contact',
      'oneToOne',
      'api::map-room.map-room'
    >;
    email: Attribute.Email;
    receptionTime: Attribute.JSON;
  };
}

export interface EmployeesPosition extends Schema.Component {
  collectionName: 'components_employees_positions';
  info: {
    displayName: 'Position';
    description: '';
  };
  attributes: {
    department: Attribute.String;
    post: Attribute.String;
    contacts: Attribute.Component<'employees.contact', true>;
  };
}

export interface EmployeesReceptionTime extends Schema.Component {
  collectionName: 'components_employees_reception_times';
  info: {
    displayName: 'Reception time';
    description: '';
  };
  attributes: {
    timeStart: Attribute.Time & Attribute.Required;
    timeEnd: Attribute.Time & Attribute.Required;
    weekday: Attribute.Enumeration<
      [
        'monday  ',
        'tuesday  ',
        'wednesday  ',
        'thursday  ',
        'friday  ',
        'saturday  ',
        'sunday'
      ]
    > &
      Attribute.Required;
  };
}

export interface LandingAuthor extends Schema.Component {
  collectionName: 'components_landing_authors';
  info: {
    displayName: 'Author';
    icon: 'id-badge';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    githubLink: Attribute.String & Attribute.Required;
    image: Attribute.Media;
  };
}

export interface LandingBadge extends Schema.Component {
  collectionName: 'components_landing_badges';
  info: {
    displayName: 'Badge';
    icon: 'id-badge';
    description: '';
  };
  attributes: {
    text: Attribute.String & Attribute.Required;
    color: Attribute.Enumeration<
      ['primary', 'secondary', 'accent', 'neutral']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'primary'>;
  };
}

export interface LandingLink extends Schema.Component {
  collectionName: 'components_landing_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    website: Attribute.Enumeration<
      [
        'Telegram',
        'VK',
        'Discord',
        'GooglePlay',
        'AppStore',
        'GitHub',
        'Swagger',
        'RTU MIREA',
        'Mirea Ninja Forum',
        'Another site'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Another site'>;
    link: Attribute.String & Attribute.Required;
  };
}

export interface LandingProjectCard extends Schema.Component {
  collectionName: 'components_landing_project_cards';
  info: {
    displayName: 'Project Card';
    icon: 'receipt';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.String & Attribute.Required;
    icon: Attribute.Media;
    badges: Attribute.Component<'landing.badge', true>;
    authors: Attribute.Component<'landing.author', true>;
    links: Attribute.Component<'landing.link', true>;
  };
}

export interface ScheduleLesson extends Schema.Component {
  collectionName: 'components_schedule_lessons';
  info: {
    displayName: 'Lesson';
    icon: 'align-justify';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    teachers: Attribute.Relation<
      'schedule.lesson',
      'oneToMany',
      'api::teacher.teacher'
    >;
    weeks: Attribute.JSON & Attribute.Required;
    timeStart: Attribute.Time & Attribute.Required;
    timeEnd: Attribute.Time & Attribute.Required;
  };
}

export interface ScheduleWeekdays extends Schema.Component {
  collectionName: 'components_schedule_weekdays';
  info: {
    displayName: 'Weekdays';
    icon: 'calendar';
  };
  attributes: {
    monday: Attribute.Component<'schedule.lesson', true>;
    tuesday: Attribute.Component<'schedule.lesson', true>;
    wednesday: Attribute.Component<'schedule.lesson', true>;
    thursday: Attribute.Component<'schedule.lesson', true>;
    friday: Attribute.Component<'schedule.lesson', true>;
    saturday: Attribute.Component<'schedule.lesson', true>;
  };
}

export interface StoriesAction extends Schema.Component {
  collectionName: 'components_stories_actions';
  info: {
    displayName: 'Action';
    icon: 'allergies';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    url: Attribute.String & Attribute.Required;
  };
}

export interface StoriesPage extends Schema.Component {
  collectionName: 'components_stories_pages';
  info: {
    displayName: 'Page';
    icon: 'pause';
    description: '';
  };
  attributes: {
    title: Attribute.String;
    text: Attribute.Text;
    media: Attribute.Media & Attribute.Required;
    actions: Attribute.Component<'stories.action', true> &
      Attribute.SetMinMax<{
        max: 2;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Shared {
    export interface Components {
      'employees.contact': EmployeesContact;
      'employees.position': EmployeesPosition;
      'employees.reception-time': EmployeesReceptionTime;
      'landing.author': LandingAuthor;
      'landing.badge': LandingBadge;
      'landing.link': LandingLink;
      'landing.project-card': LandingProjectCard;
      'schedule.lesson': ScheduleLesson;
      'schedule.weekdays': ScheduleWeekdays;
      'stories.action': StoriesAction;
      'stories.page': StoriesPage;
    }
  }
}
