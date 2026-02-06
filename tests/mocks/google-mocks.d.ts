/**
 * Mock Google APIs for testing
 */
import type { calendar_v3 } from 'googleapis';
export declare const mockEvents: calendar_v3.Schema$Event[];
export declare const mockFreeBusyResponse: calendar_v3.Schema$FreeBusyResponse;
export declare const mockCalendarList: calendar_v3.Schema$CalendarList;
export declare const createMockOAuth2Client: () => {
    generateAuthUrl: jest.Mock<any, any, any>;
    getTokenFromCode: jest.Mock<any, any, any>;
    setCredentials: jest.Mock<any, any, any>;
    getAccessToken: jest.Mock<any, any, any>;
    on: jest.Mock<any, any, any>;
};
export declare const createMockCalendarApi: () => {
    events: {
        list: jest.Mock<any, any, any>;
        get: jest.Mock<any, any, any>;
        insert: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        delete: jest.Mock<any, any, any>;
    };
    freebusy: {
        query: jest.Mock<any, any, any>;
    };
    calendarList: {
        list: jest.Mock<any, any, any>;
    };
};
export declare const mockGoogleapis: {
    google: {
        calendar: jest.Mock<any, any, any>;
    };
};
export declare const mockFs: {
    readFileSync: jest.Mock<any, any, any>;
    writeFileSync: jest.Mock<any, any, any>;
    existsSync: jest.Mock<any, any, any>;
    mkdirSync: jest.Mock<any, any, any>;
};
export declare const mockPath: {
    join: jest.Mock<any, any, any>;
    resolve: jest.Mock<any, any, any>;
};
//# sourceMappingURL=google-mocks.d.ts.map