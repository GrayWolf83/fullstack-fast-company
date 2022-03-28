import React, { useEffect, useState } from 'react'
import { validator } from '../../../utils/validator'
import TextField from '../../common/form/textField'
import SelectField from '../../common/form/selectField'
import RadioField from '../../common/form/radioField'
import MultiSelectField from '../../common/form/multiSelectField'
import { useHistory } from 'react-router-dom'
import BackHistoryButton from '../../common/backButton'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import {
    getQualities,
    getQualitiesByIds,
    getQualitiesLoadingStatus
} from '../../../store/qualities'
import {
    getProfessions,
    getProfessionsLoadingStatus
} from '../../../store/professions'
import { getCurrentUserData, updateUserData } from '../../../store/users'

const EditUserPage = () => {
    const dispatch = useDispatch()
    const currentUser = useSelector(getCurrentUserData())
    const history = useHistory()

    const [data, setData] = useState({
        password: '',
        profession: '',
        sex: 'male',
        name: '',
        qualities: [],
        licence: false
    })
    const qualities = useSelector(getQualities())
    const qualitiesLoading = useSelector(getQualitiesLoadingStatus())
    const professions = useSelector(getProfessions())
    const professionsLoading = useSelector(getProfessionsLoadingStatus())
    const qualitiesList = transformData(qualities)
    const professionsList = transformData(professions)
    const [errors, setErrors] = useState({})
    const userQualities = useSelector(getQualitiesByIds(currentUser.qualities))

    useEffect(() => {
        if (!qualitiesLoading && !professionsLoading) {
            setData({
                ...currentUser,
                qualities: transformData(userQualities)
            })
        }
    }, [qualitiesLoading, professionsLoading])

    function transformData(arr) {
        return arr.map((q) => ({
            label: q.name,
            value: q._id
        }))
    }

    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }))
    }

    const validatorConfig = {
        name: {
            isRequired: {
                message: 'Имя обязательно для заполнения'
            },
            min: {
                message: 'Имя должно состоять минимум из 3 символов',
                value: 3
            }
        },
        qualities: {
            isRequired: {
                message: 'Обязательно выберите ваши качества'
            }
        }
    }
    useEffect(() => {
        validate()
    }, [data])

    const validate = () => {
        const errors = validator(data, validatorConfig)
        setErrors(errors)
        return Object.keys(errors).length === 0
    }
    const isValid = Object.keys(errors).length === 0

    const handleSubmit = async (e) => {
        e.preventDefault()
        const isValid = validate()
        if (!isValid) return
        const newData = {
            ...data,
            qualities: data.qualities.map((q) => q.value)
        }

        // Если ничего не изменено, то запрос отправлятся не будет
        const isUserNotChanged = Object.keys(newData).every((item) => {
            if (Array.isArray(newData[item])) {
                return (
                    newData[item].every((i) => currentUser[item].includes(i)) &&
                    newData[item].length === currentUser[item].length
                )
            }
            return newData[item] === currentUser[item]
        })

        if (isUserNotChanged) {
            return toast.warning('Вы ничего не изменили')
        }
        dispatch(updateUserData(newData))
        history.push('/users/' + currentUser._id)
    }

    return (
        <div className="container mt-3">
            <BackHistoryButton />

            <div className="row">
                <div className="col-md-6 offset-md-3 shadow p-3">
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Имя"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            error={errors.name}
                        />
                        <SelectField
                            label="Выбери свою профессию"
                            defaultOption="Choose..."
                            options={professionsList}
                            name="profession"
                            onChange={handleChange}
                            value={data.profession}
                            error={errors.profession}
                        />
                        <RadioField
                            options={[
                                { name: 'Male', value: 'male' },
                                { name: 'Female', value: 'female' },
                                { name: 'Other', value: 'other' }
                            ]}
                            value={data.sex}
                            name="sex"
                            onChange={handleChange}
                            label="Выберите ваш пол"
                        />
                        {data.profession && (
                            <MultiSelectField
                                options={qualitiesList}
                                onChange={handleChange}
                                defaultValue={data.qualities}
                                name="qualities"
                                label="Выберите ваши качества"
                                error={errors.qualities}
                            />
                        )}

                        <button
                            className="btn btn-primary w-100 mx-auto"
                            type="submit"
                            disabled={!isValid}>
                            Обновить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditUserPage
