import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router";

export default function RegistrationComponent() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const {createUser} = useAuth()
    const registrationSubmit = function (data) {
        createUser(data.email,data.password)
        .then(res=>{
            console.log(res.user);
        })
        .catch(err=>{
            console.log(err);
        })
    }

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <h1 className="text-5xl font-bold">Create an account</h1>
                <form onSubmit={handleSubmit(registrationSubmit)}>
                    <fieldset className="fieldset">
                        <label className="label">Name <span className="text-error">*</span></label>
                        <input type="text" className="input" placeholder="Full Name" {...register('name', { required: true })} />
                        <label className="label">Email</label>
                        <input type="email" className="input" placeholder="Email" {...register('email')} />
                        <label className="label">Password</label>
                        <input type="password" className="input" placeholder="Password" {...register('password', {
                            required: true,
                            minLength: 6
                        })} />
                        {errors.password?.type === 'required' && <p className="text-error">Password is required</p>}
                        {errors.password?.type === 'minLength' && <p className="text-error">Password must be at least 6 characters</p>}
                        <button className="btn btn-neutral mt-4">Register</button>
                    </fieldset>
                    <p>Already have an account? <Link to={'/login'} className="link link-hover">Login</Link></p>
                </form>
            </div>
        </div>
    )
}
