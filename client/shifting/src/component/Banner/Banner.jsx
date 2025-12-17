import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import imageOne from '../../assets/image-1.jpg';
import imageTwo from '../../assets/image-2.png';
import imageThree from '../../assets/image-3.jpg';

export default function Banner() {
    return (
        <Carousel>
            <div>
                <img src={imageOne} />
                <p className="legend">Legend 1</p>
            </div>
            <div>
                <img src={imageTwo} />
                <p className="legend">Legend 2</p>
            </div>
            <div>
                <img src={imageThree} />
                <p className="legend">Legend 3</p>
            </div>
        </Carousel>
    )
}
