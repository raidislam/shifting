import { useForm } from "react-hook-form";

export default function LoginComponent() {
    const { register, handleSubmit ,formState:{errors}} = useForm();

    const loginSubmit = function(data){
        console.log(data);
    }

    return (
        <form onSubmit={handleSubmit(loginSubmit)}>
            <fieldset className="fieldset">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Email" {...register('email')} />
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Password" {...register('password',{
                    required: true,
                    minLength: 6
                })} />
                <div><a className="link link-hover">Forgot password?</a></div>
                <button className="btn btn-neutral mt-4">Login</button>
            </fieldset>
        </form>
    )
}
