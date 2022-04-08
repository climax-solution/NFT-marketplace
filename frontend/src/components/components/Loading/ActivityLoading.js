import Skeleton from 'react-loading-skeleton'
const items = [...Array(4).keys()];

export default function ActivityLoading() {
    return (
        <>
            {
                items.map((item, index) => (
                    <li className='list-unstyled loading-item' key={index}>
                        <div className="d-flex align-items-center">
                            <Skeleton className="lazy w-100px rounded-circle ratio-1-1 position-relative"/>
                            <h4 className="ms-2 mx-150px w-100"><Skeleton/></h4>
                        </div>
                        <div className="act_list_text ps-0 mt-2 text-break">
                            <h4 className='mx-150px'><Skeleton/></h4>
                            <h4 className='w-50'><Skeleton/></h4>
                            <h4><Skeleton/></h4>
                        </div>
                    </li>
                ))
            }     
        </>
    )
}