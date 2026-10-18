export interface OfficeRoom {
  id: string
  name: string
  subtitle: string
  center: [number, number]
  radius: number
  entry: [number, number]
  marker: [number, number]
}

export interface CollisionBox {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const planPoint = (imageX: number, imageY: number): [number, number] => [
  (imageX - 768) / 56,
  (imageY - 482) / 56
]

const pointBox = (x: number, z: number, width: number, depth: number): CollisionBox => ({
  minX: x - width / 2,
  maxX: x + width / 2,
  minZ: z - depth / 2,
  maxZ: z + depth / 2
})

export const mainEntrance = planPoint(900, 925)

export const officeRooms: OfficeRoom[] = [
  {
    id: 'reception',
    name: 'RECEPTION',
    subtitle: 'The First Impression',
    center: planPoint(859, 430),
    radius: 2.6,
    entry: planPoint(988, 440),
    marker: planPoint(877, 493)
  },
  {
    id: 'central-lounge',
    name: 'CENTRAL LOUNGE',
    subtitle: 'A Place to Connect',
    center: planPoint(561, 430),
    radius: 2.4,
    entry: planPoint(640, 478),
    marker: planPoint(559, 476)
  },
  {
    id: 'west-lounge',
    name: 'WEST LOUNGE',
    subtitle: 'Informal Conversations',
    center: planPoint(232, 423),
    radius: 2.25,
    entry: planPoint(349, 458),
    marker: planPoint(234, 401)
  },
  {
    id: 'collaboration',
    name: 'COLLABORATION',
    subtitle: 'Open Workspaces',
    center: planPoint(1178, 426),
    radius: 2.7,
    entry: planPoint(1057, 451),
    marker: planPoint(1178, 420)
  },
  {
    id: 'side-lounge',
    name: 'SIDE LOUNGE',
    subtitle: 'A Quiet Retreat',
    center: planPoint(1392, 424),
    radius: 1.9,
    entry: planPoint(1333, 489),
    marker: planPoint(1393, 449)
  },
  {
    id: 'executive',
    name: 'EXECUTIVE OFFICE',
    subtitle: 'Private Suite',
    center: planPoint(296, 147),
    radius: 2.2,
    entry: planPoint(390, 262),
    marker: planPoint(304, 177)
  },
  {
    id: 'informal-meeting',
    name: 'LOUNGE MEETING ROOM',
    subtitle: 'A More Personal Exchange',
    center: planPoint(543, 153),
    radius: 1.55,
    entry: planPoint(554, 262),
    marker: planPoint(546, 171)
  },
  {
    id: 'meeting',
    name: 'MEETING ROOM',
    subtitle: 'Focused Conversation',
    center: planPoint(799, 181),
    radius: 2.5,
    entry: planPoint(780, 263),
    marker: planPoint(803, 173)
  },
  {
    id: 'boardroom',
    name: 'BOARDROOM',
    subtitle: 'Strategy & Leadership',
    center: planPoint(1194, 174),
    radius: 3.1,
    entry: planPoint(1150, 263),
    marker: planPoint(1203, 181)
  }
]

const collisionBounds: [number, number, number, number][] = [
  // Exterior shell and service-wing boundaries.
  [0.425, -8.1, 23.45, 0.2],
  [-11.3, -6.22, 0.2, 3.76],
  [-11.3, -3.69, 0.2, 1.32],
  [12.15, -6.22, 0.2, 3.76],
  [12.95, -1.7, 0.2, 5.2],
  [-13.2, -0.2, 0.2, 2.3],
  [-12, -2.09, 0.2, 1.4],
  [-12, -0.2, 0.2, 2.3],
  [-12, 3.4, 0.2, 4.9],
  [-8.9, 3.4, 0.2, 4.9],
  [-6.35, 8.05, 5.1, 0.2],
  [-2.5, 8.05, 2.6, 0.2],
  [7.95, 8.05, 7.3, 0.2],
  [11.6, 4.5, 0.2, 7.1],

  // Glazed suite walls, with real openings at the corridor doors.
  [-9.375, -4.32, 3.85, 0.17], [-5.925, -4.32, 0.25, 0.17],
  [-5.05, -4.32, 0.7, 0.17], [-2.94, -4.32, 0.62, 0.17],
  [-1.59, -4.32, 2.08, 0.17], [2.4, -4.32, 2.6, 0.17],
  [4.8, -4.32, 2.2, 0.17], [9.825, -4.32, 4.65, 0.17],
  [-5.8, -6.22, 0.16, 3.55], [-2.63, -6.22, 0.16, 3.55],
  [3.7, -6.22, 0.16, 3.55],
  [-9.05, -3.03, 4.3, 0.12], [-2.8, -3.03, 4.2, 0.12],
  [2.65, -3.03, 3.5, 0.12], [8.7, -3.03, 5.8, 0.12],

  // Interior screens and access walls between the service wings.
  [-6.55, -0.9, 0.16, 3.5], [1.72, -1.02, 3.8, 0.16],
  [-3.8, 1.32, 0.18, 0.75], [-3.8, 5.47, 0.18, 5.15],
  [3.2, 1.325, 0.18, 0.75], [3.2, 5.475, 0.18, 5.15],
  [4.4, 1.42, 0.18, 0.95], [4.4, 5.62, 0.18, 4.85],
  [3.8, 0.95, 1.25, 0.18],

  // Reception, lounge and collaboration furniture.
  [-8.08, 0.1, 2.8, 0.9], [-9.48, -1.39, 1.7, 0.95],
  [-3.66, -1.27, 2.95, 0.95], [-3.66, -0.27, 1.48, 0.95],
  [1.77, -0.09, 3.25, 1.2],
  [7.4, -1.9, 0.76, 1.15], [7.4, -0.9, 0.76, 1.15],
  [7.4, 0.08, 0.76, 1.15], [5.85, -1.9, 0.76, 1.15],
  [5.85, -0.9, 0.76, 1.15], [5.85, 0.08, 0.76, 1.15],
  [10.85, -1.66, 1.1, 0.95], [11.16, -0.64, 0.9, 0.75],

  // Meeting tables, executive desk, boardroom and major stair flights.
  [-8.35, -5.53, 3.0, 1.0], [-8.16, -7.05, 2.15, 0.95],
  [0.96, -5.55, 2.58, 1.0], [7.8, -5.48, 4.7, 1.1],
  [-5.15, 1.65, 4.15, 3.4], [-6.16, 5.75, 4.1, 2.45],
  [7.8, 4.24, 6.4, 3.3],

  // Elevator core.
  [-0.85, 5.2, 4.5, 2.65]
]

export const collisionBoxes = collisionBounds.map(([x, z, width, depth]) =>
  pointBox(x, z, width, depth)
)

export function imagePointToWorld([imageX, imageY]: [number, number]): [number, number] {
  return planPoint(imageX, imageY)
}
