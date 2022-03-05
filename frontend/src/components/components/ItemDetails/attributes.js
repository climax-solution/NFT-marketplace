export default function Attr({data}) {
    return (
        <>
            <h4>Attributes</h4>
            <div className="row">
                {
                    data.map((item, index) => {
                        return (
                            <div className="col-md-6 col-12 mb-3" key={index}>
                                <div className="border px-1 py-5 h-100 border-grey rounded">
                                    <h5 className="text-center">{item.trait_type}</h5>
                                    <p className="text-center">{item.value}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}