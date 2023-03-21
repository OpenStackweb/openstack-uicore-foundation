export const DraggableItemTypes = {
    UNSCHEDULEEVENT: 'UnScheduleEvent',
    SCHEDULEEVENT: 'ScheduleEvent',
};

export const TBALocation = {id : 0, name : 'TBD', class_name: 'SummitVenue'};
export const SlotSizeOptions = [1,5,10,15,30,60]; // 12 - 6 - 4 - 2 - 1
export const PixelsPerMinute = 3;

export const BulkActionEdit                    = 'BULK_ACTION_EDIT';
export const BulkActionPublish                 = 'BULK_ACTION_PUBLISH';
export const BulkActionUnPublish               = 'BULK_ACTION_UNPUBLISH';

export const bulkOptions = [
    {value: BulkActionEdit, label: 'Edit'},
    {value: BulkActionUnPublish, label: 'Unpublish'},
];
