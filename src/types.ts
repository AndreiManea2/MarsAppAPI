export enum CameraType {
    FHAZ = 'FHAZ',
    RHAZ = 'RHAZ',
    NAVCAM = 'NAVCAM',
    PANCAM = 'PANCAM',
    MINITES = 'MINITES',
    MAHLI = 'MAHLI',
    MAST = 'MAST',
    CHECAM = 'CHECAM'
}

export interface MarsPhoto {
    id: number;
    img_src: string;
    earth_date: string;
    rover: {
        name: string;
    };
    camera: {
        name: string;
        full_name: string;
    };
}