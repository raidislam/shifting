import React from 'react'

export default function MercentBanner() {
    return (
        <div className="hero bg-base-200 my-16">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <img
                    src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                    className="max-w-sm rounded-lg shadow-2xl"
                />
                <div>
                    <h1 className="text-5xl font-bold">Merchent and Customer Satisfaction is our First Priority</h1>
                    <p className="py-6">
                        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
                        quasi. In deleniti eaque aut repudiandae et a id nisi.
                    </p>
                    <div className='flex gap-4'>
                        <button className="btn btn-primary rounded-full">Become Merchent</button>
                        <button className="btn btn-transparent border rounded-full">Earn with Courier</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
