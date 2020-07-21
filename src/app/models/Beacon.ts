export namespace beacon {

  export interface User {
    name: string;
    gender: number;
    birth_date?: any;
    categories: string[];
    email_address: string;
    phone?: any;
    created_on?: any;
    updated_on: Date;
    gcm_instance_id?: any;
    profile_image_url: string;
    id: string;
  }

  export interface BeaconRootObject {
    timestamp: Date;
    device_id: number;
    ping_type: number;
    user_id: string;
    dwell?: any;
    smile?: any;
    user: User;
    latitude?: any;
    longitude?: any;
    id: string;
  }

}

