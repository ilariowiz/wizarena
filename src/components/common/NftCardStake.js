import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import { IoMedalOutline } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'
import '../../css/Nft.css'
import 'reactjs-popup/dist/index.css';
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import {
    getInfoNftBurning,
    selectWizard
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'

const logoKda = require('../../assets/kdalogo2.png')

class NftCardStake extends Component {
	constructor(props) {
        super(props)

        this.state = {
            inBurnQueue: this.props.item.confirmBurn,
            infoBurn: {}
        }
    }

	componentDidMount() {
        const { index, item } = this.props

        //per non far partire le connessioni tutte insieme
        const timer = index * 100

        setTimeout(() => {
            if (item.confirmBurn) {
                this.loadInfoBurn()
            }
        }, timer)
	}

    loadInfoBurn() {
        const { item, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getInfoNftBurning(chainId, gasPrice, gasLimit, networkUrl, item.id, (response) => {
            //console.log(response);
            this.setState({ infoBurn: response })
        })
    }

    getEquipment() {
		const { equipment, item } = this.props

        //console.log(equipment);

		if (!equipment || equipment.length === 0) {
			return ""
		}

		const ring = equipment.filter(i => i.equippedToId === item.id)

		//console.log(ring);

		return ring
	}

    renderBurningTop() {
        const { infoBurn } = this.state
        const { mainTextColor } = this.props

        if (!infoBurn.confirmBurn) {
            return <div />
        }

        const burnedFromDate = moment(infoBurn.timestamp.timep).fromNow()

        return (
            <div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: mainTextColor, fontSize: 14, textAlign: 'end' }}>
					In Burning Queue
				</p>

				<p style={{ color: '#707070', fontSize: 13, marginBottom: 2, lineHeight: 1 }}>
					{burnedFromDate}
				</p>
			</div>
        )
    }

    calcMedals() {
        const { item } = this.props

        let totalMedals = 0
		if (item.medals && Object.keys(item.medals).length > 0) {
			const arrayValueMedals = Object.values(item.medals)
			arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
		}

        return totalMedals
    }

    renderEquipment(item, index) {
        return (
            <Popup
                trigger={open => (
                    <div style={{ alignItems: 'center' }}>
                        <img
                            src={item.url}
                            style={{ width: 32, height: 32 }}
                            alt={item.name}
                        />
                    </div>
                )}
                position="top center"
                on="hover"
                key={index}
            >
                <div style={{ padding: 5, fontSize: 16, color: "#1d1d1f" }}>
                    {item.name}
                </div>
            </Popup>
        )
    }

	render() {
		const { item, history, width, stakeInfo, loading, mainTextColor, isDarkmode } = this.props
		const { inBurnQueue } = this.state

        //console.log(stakeInfo);

        const equipment = this.getEquipment()

        //console.log(equipment);

		return (
			<a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				onClick={(e) => {
                    e.preventDefault()
                    this.props.selectWizard(item.id)
                    history.push(`/nft/${item.id}`)
                }}
                style={{ marginBottom: 12, position: 'relative' }}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

                <div style={{ position: 'absolute', top: width - 32, right: 0, borderTopLeftRadius: 4, alignItems: 'center', backgroundColor: '#ffffff60', paddingLeft: 5, paddingRight: 5 }}>
                    {equipment && equipment.length > 0 && equipment.map((item, index) => {
                        return this.renderEquipment(item, index)
                    })}
                </div>

                <div style={{ width, marginTop: 5, minHeight: 28, alignItems: 'center' }}>
                    <p style={{ color: mainTextColor, fontSize: 14, lineHeight: 1, marginLeft: 10, marginRight: 10 }} className="text-medium">
                        {item.nickname ? `${item.name} ${item.nickname}` : item.name}
                    </p>
                </div>

				<div style={{ justifyContent: 'space-between', width, height: 60, alignItems: 'center' }}>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>


                        <div style={{ alignItems: 'center' }}>
                            {
                                item.medals &&
                                <div style={{ alignItems: 'center', marginLeft: 10, marginBottom: 5 }}>

                                    <p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1, marginRight: 3 }} className="text-medium">
                                        {this.calcMedals()}
                                    </p>

                                    <IoMedalOutline
                                        color={mainTextColor}
                                        size={16}
                                        style={{ marginRight: 10 }}
                                    />

                                    <p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1 }}>
                                        |
                                    </p>
                                </div>
                            }

                            <div style={{ alignItems: 'center', marginLeft: 10, marginBottom: 5 }}>

                                <p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1, marginRight: 3 }} className="text-medium">
                                    {item.ap.int}
                                </p>

                                <p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1 }}>
                                    AP
                                </p>
                            </div>

                        </div>

                        {
                            item.level &&
                            <div style={{ alignItems: 'center', marginLeft: 10 }}>
                                <p style={{ color: mainTextColor, fontSize: 15, marginRight: 7 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 16 }} className="text-bold">
                                    {item.level}
                                </p>
                            </div>
                        }
					</div>

					{
						item.listed ?
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginRight: 10 }}>
							<p style={{ color: '#707070', fontSize: 14, lineHeight: 1 }}>
								Price
							</p>

							<div style={{ marginLeft: 10, alignItems: 'center' }}>

								<img
									style={{ width: 23, marginRight: 3, objectFit: 'contain' }}
									src={logoKda}
									alt='Kadena logo'
								/>

								<p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1 }} className="text-bold">
									{item.price}
								</p>
							</div>
						</div>
						: null
					}

                    {
                        inBurnQueue ?
                        this.renderBurningTop()
                        : null
                    }

				</div>

                {/********************* PARTE BOTTOM **********************/}

				{
					loading &&
					<div
						style={Object.assign({}, styles.btnStake, { width })}
					>
						<DotLoader size={16} color={mainTextColor} />
					</div>
				}

                {
                    item.listed && !loading &&
                    <button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width })}
						onClick={(e) => {
                            e.preventDefault()
							e.stopPropagation()
							this.props.onDelist()
						}}
					>
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
							Delist
						</p>
					</button>
                }

                {
                    !item.medals &&
                    <div style={{ height: 40 }} />
                }

				{
					!inBurnQueue && !item.listed && item.medals && !loading &&
                    <div style={{ width, alignItems: 'center', justifyContent: 'space-between' }}>
    					<button
    						className="btnH"
    						style={Object.assign({}, styles.btnStake, { width, backgroundColor: "#840fb2" })}
    						onClick={(e) => {
                                e.preventDefault()
    							e.stopPropagation()
    							this.props.onAddBurning()
    						}}
    					>
    						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    							Burn
    						</p>
    					</button>
                    </div>
				}

                {
                    inBurnQueue && !item.listed && item.medals && !loading &&
					<button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width, backgroundColor: "#840fb2" })}
						onClick={(e) => {
                            e.preventDefault()
							e.stopPropagation()
							this.props.onRemoveBurning()
						}}
					>
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
							Remove from Burning queue
						</p>
					</button>
                }

			</a>
		)
	}
}

const styles = {
	btnStake: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps, {
    getInfoNftBurning,
    selectWizard
})(NftCardStake);
