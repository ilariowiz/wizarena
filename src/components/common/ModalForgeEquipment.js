import React, { Component } from 'react';
import EquipmentCardForge from './EquipmentCardForge'
import '../../css/Modal.css'
import '../../css/ItemCard.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalForgeEquipment extends Component {
    renderItem(item, index) {

        return (
            <EquipmentCardForge
                item={item}
                key={index}
                index={index}
                onSelectRing={() => this.props.onSelectRing(item)}
            />
        )
    }

	render() {
		const { showModal, rings } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const maxHeight = window.innerHeight * 80 / 100
        const width = window.innerWidth * 80 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, maxHeight })}>

					<p style={{ color: 'white', fontSize: 22, marginBottom: 20, marginTop: 20 }}>
						Your Rings:
					</p>

                    <div style={{ flexWrap: 'wrap', marginBottom: 20, maxHeight, overflow: 'auto', justifyContent: 'center' }}>
                        {rings.map((item, index) => {
                            return this.renderItem(item, index)
                        })}
                    </div>

                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.props.onCloseModal()
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            CLOSE
                        </p>
                    </button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        paddingLeft: 15,
        paddingRight: 15
	},
    btnChoose: {
        minHeight: 40,
        height: 40,
        width: 150,
        minWidth: 100,
        marginBottom: 15,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
}

export default ModalForgeEquipment;
