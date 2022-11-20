class NameEntity{
    $regex: string;
}

class QueryEntity{
    name: NameEntity;
}

class OptionsEntity{
    pagination: boolean;
    limit: number;
}

export class Launch {
    query: QueryEntity;
    options: OptionsEntity;
}
