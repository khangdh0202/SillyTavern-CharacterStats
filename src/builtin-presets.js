export const BUILTIN_PRESET_VARIANTS = [
    { id: "main", label: "Protagonist / {{user}}" },
    { id: "companion", label: "Companion" },
    { id: "minor", label: "Minor NPC" }
];

export function buildBuiltinPresetGenres() {
    const bar = color => ({ enabled: true, color });
    const num = (name, base, min, max, description, extra = {}) =>
        ({ name, type: "number", base, min, max, description, ...extra });
    const choice = (name, options, base, description, extra = {}) =>
        ({ name, type: "choice", options, base, description, ...extra });
    const text = (name, base, description, extra = {}) =>
        ({ name, type: "text", base, description, ...extra });
    const fixed = { aiBaseEdit: true };
    const group = (name, list) => list.map(stat => ({ ...stat, group: name }));

    const RED = "#ef4444", BLUE = "#3b82f6", AMBER = "#f59e0b", PURPLE = "#a855f7", PINK = "#ec4899", GREEN = "#22c55e", TEAL = "#2dd4bf";

    const hp = (max = 100) => num("HP", max, 0, max, "Health. 0 = down / dying.", { progressBar: bar(RED) });
    const stamina = () => num("Stamina", 100, 0, 100, "Physical endurance; drops with exertion, recovers with rest.", { progressBar: bar(AMBER) });
    const mood = () => choice("Mood", ["Calm", "Happy", "Excited", "Anxious", "Sad", "Angry", "Afraid"], "Calm", "Current emotional state.");
    const disposition = () => choice("Disposition", ["Hostile", "Unfriendly", "Neutral", "Friendly", "Ally"], "Neutral", "Attitude toward {{user}}.");
    const bond = (relationOptions = ["Stranger", "Acquaintance", "Friend", "Close Friend", "Rival", "Enemy"]) => group("Bond", [
        num("Affection", 0, -100, 100, "Feelings toward {{user}}: negative = dislike, positive = fondness.", { progressBar: bar(PINK) }),
        num("Trust", 30, 0, 100, "How much they rely on and believe {{user}}.", { progressBar: bar(TEAL) }),
        choice("Relationship", relationOptions, relationOptions[0], "Current relationship with {{user}}; change it only on a clear story event."),
        mood()
    ]);
    const levelUp = (rule, expRule = "When EXP reaches Level × 100: Level +1 and EXP keeps only the remainder.") => [
        num("Level", 1, 1, 999, "Character level.", { ...fixed, onChange: rule }),
        num("EXP", 0, 0, null, "Experience toward the next level.", { ...fixed, onChange: expRule })
    ];

    return [
        {
            id: "fantasy",
            icon: "⚔️",
            name: "Fantasy RPG",
            description: "Sword & sorcery adventure: classic attributes, mana, levels, gold and quests.",
            main: {
                stats: [
                    ...group("Vitals", [hp(), num("MP", 50, 0, 50, "Mana for spells and abilities.", { progressBar: bar(BLUE) }), stamina()]),
                    ...group("Attributes", ["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(key =>
                        num(key, 10, 1, 30, {
                            STR: "Strength: melee power, lifting.",
                            DEX: "Dexterity: agility, aim, stealth.",
                            CON: "Constitution: toughness, resisting poison and fatigue.",
                            INT: "Intelligence: knowledge, arcane magic.",
                            WIS: "Wisdom: perception, intuition, divine magic.",
                            CHA: "Charisma: persuasion, presence."
                        }[key], fixed))),
                    ...group("Progress", [
                        ...levelUp("On level up: raise HP and MP max by 10 / 5 and add +1 to one fitting attribute."),
                        num("Gold", 10, 0, null, "Money.", { unit: "g" })
                    ]),
                    ...group("Identity", [text("Race", "Human", "Race / ancestry."), text("Class", "Adventurer", "Class or profession.")])
                ],
                custom: { quests: { active: {}, completed: [] }, spells: {}, factions: {}, notes: "" },
                inventory: [
                    { name: "Travel rations", quantity: 3 },
                    { name: "Waterskin", quantity: 1 },
                    { name: "Dagger", quantity: 1, equippable: true, equipped: true }
                ]
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp(), num("MP", 50, 0, 50, "Mana.", { progressBar: bar(BLUE) }), stamina()]),
                    ...group("Progress", [num("Level", 1, 1, 999, "Character level.", fixed), text("Class", "Adventurer", "Class or profession.")]),
                    ...bond()
                ],
                custom: { backstory: "", loyalties: {} }
            },
            minor: {
                stats: [hp(30), disposition(), choice("Threat", ["None", "Low", "Medium", "High", "Deadly"], "None", "Danger in a fight.")]
            }
        },
        {
            id: "system",
            icon: "🌀",
            name: "System / LitRPG / Isekai",
            description: "A game-like System: levels, stat points, ranks F→SSS, titles and System quests.",
            main: {
                stats: [
                    ...group("Vitals", [hp(), num("MP", 50, 0, 50, "Mana.", { progressBar: bar(BLUE) }), stamina()]),
                    ...group("Attributes", ["STR", "AGI", "VIT", "INT", "PER", "LUK"].map(key =>
                        num(key, 5, 1, 999, {
                            STR: "Strength.",
                            AGI: "Agility and speed.",
                            VIT: "Vitality: HP and resistance.",
                            INT: "Intelligence: MP and magic power.",
                            PER: "Perception: senses and awareness.",
                            LUK: "Luck."
                        }[key], fixed))),
                    ...group("Progress", [
                        ...levelUp("On level up: Stat Points +5 and HP / MP restore to max (System notification)."),
                        num("Stat Points", 0, 0, null, "Unspent points granted by the System; spending one raises an attribute by 1.", fixed),
                        choice("Rank", ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"], "F", "Official rank; changes only on a re-evaluation or promotion event."),
                        num("Coins", 0, 0, null, "Currency.")
                    ]),
                    ...group("Identity", [text("Job", "None", "Job / class the System assigned."), text("Title", "None", "Equipped title.")])
                ],
                custom: { system: { notifications: [] }, quests: { daily: {}, main: {}, hidden: {}, completed: [] }, titles: [], achievements: [] }
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp(), num("MP", 50, 0, 50, "Mana.", { progressBar: bar(BLUE) })]),
                    ...group("Progress", [
                        num("Level", 1, 1, 999, "Character level.", fixed),
                        choice("Rank", ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"], "F", "Official rank.")
                    ]),
                    ...bond()
                ]
            },
            minor: {
                stats: [
                    num("Level", 1, 1, 999, "Character level.", fixed),
                    choice("Rank", ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"], "F", "Official rank."),
                    disposition()
                ]
            }
        },
        {
            id: "cultivation",
            icon: "☯️",
            name: "Cultivation / Xianxia",
            description: "Realms and stages, qi, dao heart, karma, spirit stones and sect standing.",
            main: {
                stats: [
                    ...group("Vitals", [hp(), num("Qi", 100, 0, 100, "Spiritual energy in the dantian; spent on techniques, restored by meditation.", { progressBar: bar(PURPLE) }), stamina()]),
                    ...group("Cultivation", [
                        choice("Realm", ["Mortal", "Qi Refining", "Foundation Establishment", "Core Formation", "Nascent Soul", "Spirit Severing", "Dao Seeking", "Immortal Ascension"], "Mortal", "Cultivation realm; the next realm needs a breakthrough event."),
                        choice("Stage", ["Early", "Middle", "Late", "Peak"], "Early", "Stage inside the current realm."),
                        num("Cultivation Progress", 0, 0, 100, "Progress toward the next stage.", { ...fixed, progressBar: bar(PURPLE), onChange: "At 100: Stage +1 and progress resets to 0; from Peak, only a breakthrough moves to the next Realm." }),
                        choice("Spirit Root", ["None", "Five-element", "Four-element", "Three-element", "Dual", "Single", "Heavenly", "Mutant"], "Five-element", "Talent: rarer roots cultivate faster."),
                        num("Comprehension", 10, 1, 100, "Insight into techniques and the Dao.", fixed),
                        num("Dao Heart", 50, 0, 100, "Resolve against heart demons; failure at a breakthrough lowers it.", { progressBar: bar(TEAL) })
                    ]),
                    ...group("Standing", [
                        num("Karma", 0, -100, 100, "Karmic balance of deeds."),
                        num("Reputation", 0, -100, 100, "Fame in the cultivation world."),
                        num("Spirit Stones", 0, 0, null, "Currency and cultivation resource."),
                        num("Sect Contribution", 0, 0, null, "Points earned for the sect.")
                    ])
                ],
                custom: { techniques: {}, sect: { name: "", position: "Outer disciple", master: "" }, treasures: {}, enmities: {} }
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp(), num("Qi", 100, 0, 100, "Spiritual energy.", { progressBar: bar(PURPLE) })]),
                    ...group("Cultivation", [
                        choice("Realm", ["Mortal", "Qi Refining", "Foundation Establishment", "Core Formation", "Nascent Soul", "Spirit Severing", "Dao Seeking", "Immortal Ascension"], "Qi Refining", "Cultivation realm."),
                        choice("Stage", ["Early", "Middle", "Late", "Peak"], "Early", "Stage inside the realm.")
                    ]),
                    ...bond(["Stranger", "Acquaintance", "Fellow Disciple", "Friend", "Sworn Sibling", "Dao Companion", "Rival", "Enemy"])
                ],
                custom: { sect: "", techniques: {} }
            },
            minor: {
                stats: [
                    choice("Realm", ["Mortal", "Qi Refining", "Foundation Establishment", "Core Formation", "Nascent Soul", "Spirit Severing", "Dao Seeking", "Immortal Ascension"], "Qi Refining", "Cultivation realm."),
                    choice("Stage", ["Early", "Middle", "Late", "Peak"], "Early", "Stage inside the realm."),
                    disposition()
                ]
            }
        },
        {
            id: "superhero",
            icon: "🦸",
            name: "Superhero",
            description: "Power and control, strain, hero rank, public reputation and a secret identity.",
            main: {
                stats: [
                    ...group("Vitals", [hp(), stamina()]),
                    ...group("Powers", [
                        num("Power Level", 30, 0, 100, "Raw strength of the main power.", fixed),
                        num("Control", 30, 0, 100, "Precision; low Control risks collateral damage.", fixed),
                        num("Power Strain", 0, 0, 100, "Overuse; at 100 the power fails or backfires until rest.", { progressBar: bar(RED) })
                    ]),
                    ...group("Status", [
                        choice("Hero Rank", ["Unregistered", "D", "C", "B", "A", "S"], "Unregistered", "Official ranking; changes on an evaluation event."),
                        choice("Alignment", ["Hero", "Vigilante", "Neutral", "Antihero", "Villain"], "Hero", "How they operate."),
                        num("Reputation", 0, -100, 100, "Public opinion: negative = feared / hated."),
                        num("Identity Exposure", 0, 0, 100, "How close anyone is to linking the civilian and hero identities; 100 = exposed.", { progressBar: bar(AMBER) }),
                        num("Cash", 100, 0, null, "Money.", { unit: "$" }),
                        text("Hero Name", "", "Codename.")
                    ])
                ],
                custom: { powers: {}, secret_identity: { civilian_name: "", who_knows: [] }, rivals: {}, incidents: [] }
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp()]),
                    ...group("Powers", [num("Power Level", 30, 0, 100, "Raw strength of the main power.", fixed)]),
                    ...group("Status", [choice("Hero Rank", ["Unregistered", "D", "C", "B", "A", "S"], "Unregistered", "Official ranking.")]),
                    ...bond(["Stranger", "Acquaintance", "Teammate", "Friend", "Partner", "Mentor", "Rival", "Nemesis"])
                ],
                custom: { powers: {}, secret_identity: "" }
            },
            minor: {
                stats: [
                    choice("Threat Level", ["Civilian", "Low", "Medium", "High", "Catastrophic"], "Civilian", "Danger level."),
                    text("Affiliation", "", "Agency, team, gang or none."),
                    disposition()
                ]
            }
        },
        {
            id: "survival",
            icon: "🧟",
            name: "Survival / Zombie",
            description: "Hunger, thirst, fatigue, infection, morale, ammo and how safe the shelter is.",
            main: {
                stats: [
                    ...group("Vitals", [
                        hp(),
                        stamina(),
                        num("Infection", 0, 0, 100, "Bite / wound infection; only treatment lowers it. 100 = dead or turned.", { progressBar: bar(GREEN) })
                    ]),
                    ...group("Needs", [
                        num("Hunger", 0, 0, 100, "0 = full, 100 = starving. Rises ~10 every 3 in-game hours without food.", { progressBar: bar(AMBER) }),
                        num("Thirst", 0, 0, 100, "0 = hydrated, 100 = severe dehydration. Rises faster than Hunger.", { progressBar: bar(BLUE) }),
                        num("Fatigue", 0, 0, 100, "Rises with exertion and lost sleep; high Fatigue slows every action.", { progressBar: bar(PURPLE) })
                    ]),
                    ...group("Mind", [num("Morale", 50, 0, 100, "Will to keep going; very low Morale causes despair.", { progressBar: bar(TEAL) })]),
                    ...group("Situation", [
                        num("Ammo", 0, 0, null, "Rounds for the current firearm."),
                        choice("Safety", ["Safe", "Guarded", "Exposed", "Overrun"], "Exposed", "How safe the current spot is."),
                        num("Noise", 0, 0, 10, "Noise made in this area; attracts the dead. Falls when quiet.")
                    ])
                ],
                custom: { wounds: [], shelter: { location: "", defenses: "", supplies_days: 0 }, group: {}, map: { safe_zones: [], danger_zones: [] } },
                inventory: [
                    { name: "Water bottle", quantity: 1 },
                    { name: "Bandage", quantity: 2 }
                ]
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp(), num("Infection", 0, 0, 100, "Infection; 100 = dead or turned.", { progressBar: bar(GREEN) })]),
                    ...group("Needs", [num("Hunger", 0, 0, 100, "0 = full, 100 = starving.", { progressBar: bar(AMBER) })]),
                    ...group("Mind", [num("Morale", 50, 0, 100, "Will to keep going.", { progressBar: bar(TEAL) })]),
                    ...bond(["Stranger", "Acquaintance", "Survivor Ally", "Friend", "Family", "Rival", "Enemy"])
                ],
                custom: { skills_useful: [], wounds: [] }
            },
            minor: {
                stats: [hp(50), num("Infection", 0, 0, 100, "Infection; 100 = dead or turned."), disposition()]
            }
        },
        {
            id: "horror",
            icon: "👁️",
            name: "Horror / Mystery",
            description: "Sanity, fear, corruption, clues and the rules of whatever haunts the story.",
            main: {
                stats: [
                    ...group("Mind", [
                        num("Sanity", 100, 0, 100, "Mental stability; drops when facing the unnatural. 0 = breakdown.", { progressBar: bar(PURPLE) }),
                        num("Fear", 0, 0, 100, "Momentary terror; high Fear causes rash or frozen actions. Fades when safe.", { progressBar: bar(RED) }),
                        num("Corruption", 0, 0, 100, "Taint from the entity or occult; does not heal by itself.", { progressBar: bar(GREEN) })
                    ]),
                    ...group("Body", [hp(), stamina()]),
                    ...group("Investigation", [
                        num("Clues", 0, 0, null, "Meaningful clues found.", { onChange: "When a real clue is found: +1 and record it in custom.clues." }),
                        choice("Light", ["None", "Phone", "Flashlight", "Lantern", "Candle"], "Phone", "Current light source.")
                    ])
                ],
                custom: { clues: [], theories: [], entity: { name: "", rules: [], weaknesses: [] }, locations: {} }
            },
            companion: {
                stats: [
                    ...group("Mind", [
                        num("Sanity", 100, 0, 100, "Mental stability.", { progressBar: bar(PURPLE) }),
                        num("Fear", 0, 0, 100, "Momentary terror.", { progressBar: bar(RED) })
                    ]),
                    ...group("Body", [hp()]),
                    ...bond()
                ],
                custom: { secrets: [] }
            },
            minor: {
                stats: [
                    num("Sanity", 100, 0, 100, "Mental stability."),
                    choice("Knowledge", ["Unaware", "Suspects", "Knows", "Involved"], "Unaware", "What they know about the horror."),
                    disposition()
                ]
            }
        },
        {
            id: "romance",
            icon: "💞",
            name: "Romance / Slice of Life",
            description: "Everyday life and relationships: affection, trust, attraction, jealousy and milestones.",
            main: {
                stats: [
                    ...group("Daily", [
                        mood(),
                        num("Energy", 100, 0, 100, "Daily energy; recovers with sleep.", { progressBar: bar(AMBER) }),
                        num("Stress", 20, 0, 100, "Accumulated stress.", { progressBar: bar(RED) }),
                        num("Money", 1000, 0, null, "Money on hand.", { unit: "$" })
                    ]),
                    ...group("Personal", [
                        num("Charm", 10, 0, 100, "Social appeal.", fixed),
                        num("Confidence", 50, 0, 100, "Self-assurance in social situations."),
                        text("Occupation", "", "Job or school.")
                    ])
                ],
                custom: { relationships: {}, schedule: {}, goals: [] }
            },
            companion: {
                stats: [
                    ...group("Bond", [
                        num("Affection", 0, -100, 100, "Feelings toward {{user}}: negative = dislike, positive = fondness.", { progressBar: bar(PINK) }),
                        num("Trust", 30, 0, 100, "How much they rely on and believe {{user}}.", { progressBar: bar(TEAL) }),
                        num("Attraction", 0, 0, 100, "Romantic interest in {{user}}.", { progressBar: bar(PINK) }),
                        num("Jealousy", 0, 0, 100, "Rises when {{user}} is close to rivals; falls with reassurance."),
                        choice("Relationship", ["Stranger", "Acquaintance", "Friend", "Close Friend", "Crush", "Dating", "Lover", "Engaged", "Married", "Ex"], "Stranger", "Change only on a clear story event (confession, date, breakup…).")
                    ]),
                    ...group("Daily", [mood(), num("Energy", 100, 0, 100, "Daily energy.", { progressBar: bar(AMBER) })])
                ],
                custom: { memories: [], milestones: { first_meeting: "", first_date: "", confession: "" }, likes: [], dislikes: [], secrets: [] }
            },
            minor: {
                stats: [disposition(), mood(), text("Role", "", "Who they are to {{user}} (coworker, neighbor…).")]
            }
        },
        {
            id: "school",
            icon: "🎒",
            name: "School Life",
            description: "Grades, popularity, stress, clubs, exams and rumors.",
            main: {
                stats: [
                    ...group("School", [
                        num("Grades", 60, 0, 100, "Academic standing (average score).", fixed),
                        num("Discipline", 0, 0, 100, "Teachers' disciplinary attention; high = detention / parents called."),
                        text("Class", "1-A", "Year and class."),
                        text("Club", "None", "Club membership.")
                    ]),
                    ...group("Social", [num("Popularity", 30, 0, 100, "Standing among students.", { progressBar: bar(PINK) }), mood()]),
                    ...group("Daily", [
                        num("Fitness", 50, 0, 100, "Physical fitness.", fixed),
                        num("Energy", 100, 0, 100, "Daily energy.", { progressBar: bar(AMBER) }),
                        num("Stress", 20, 0, 100, "Exams and drama raise it.", { progressBar: bar(RED) }),
                        num("Allowance", 50, 0, null, "Pocket money.", { unit: "$" })
                    ])
                ],
                custom: { schedule: {}, clubs: [], exams: {}, rumors: [] }
            },
            companion: {
                stats: [
                    ...group("School", [num("Grades", 60, 0, 100, "Academic standing.", fixed), num("Popularity", 30, 0, 100, "Standing among students.")]),
                    ...bond(["Stranger", "Classmate", "Friend", "Best Friend", "Crush", "Dating", "Rival", "Bully"])
                ],
                custom: { likes: [], secrets: [] }
            },
            minor: {
                stats: [text("Role", "Classmate", "Classmate, teacher, senior…"), num("Popularity", 30, 0, 100, "Standing among students."), disposition()]
            }
        },
        {
            id: "cyberpunk",
            icon: "🌆",
            name: "Cyberpunk / Sci-fi",
            description: "Humanity vs cyberware, netrunning, credits, heat and street cred.",
            main: {
                stats: [
                    ...group("Vitals", [
                        hp(),
                        num("Humanity", 100, 0, 100, "Each new implant lowers it; 0 = cyberpsychosis.", { progressBar: bar(TEAL), onChange: "Installing an implant: Humanity −5 to −15 by size, record it in custom.implants." }),
                        num("Cyberware Load", 0, 0, 10, "Implant capacity in use.", { progressBar: bar(PURPLE) })
                    ]),
                    ...group("Attributes", ["Body", "Reflexes", "Tech", "Hacking", "Cool"].map(key =>
                        num(key, 5, 1, 10, {
                            Body: "Strength and toughness.",
                            Reflexes: "Speed, shooting, driving.",
                            Tech: "Crafting and repairing gear.",
                            Hacking: "Netrunning and quickhacks.",
                            Cool: "Nerve under pressure, intimidation."
                        }[key], fixed))),
                    ...group("Street", [
                        choice("Street Role", ["Solo", "Netrunner", "Techie", "Fixer", "Nomad", "Corpo", "Media", "Rockerboy"], "Solo", "Street role."),
                        num("Credits", 500, 0, null, "Money.", { unit: "€$" }),
                        num("Heat", 0, 0, 100, "Attention from police / corps; high Heat brings trouble.", { progressBar: bar(RED) }),
                        num("Street Cred", 0, 0, 100, "Reputation on the street.")
                    ])
                ],
                custom: { implants: {}, contacts: {}, gangs: {}, contracts: { active: {}, completed: [] } }
            },
            companion: {
                stats: [
                    ...group("Vitals", [hp(), num("Humanity", 100, 0, 100, "0 = cyberpsychosis.", { progressBar: bar(TEAL) })]),
                    ...group("Street", [choice("Street Role", ["Solo", "Netrunner", "Techie", "Fixer", "Nomad", "Corpo", "Media", "Rockerboy"], "Solo", "Street role.")]),
                    ...bond(["Stranger", "Contact", "Crew", "Friend", "Partner", "Rival", "Enemy"])
                ],
                custom: { implants: {} }
            },
            minor: {
                stats: [hp(40), text("Affiliation", "", "Gang, corp or crew."), disposition()]
            }
        },
        {
            id: "business",
            icon: "💼",
            name: "Business / Management",
            description: "Cash flow, reputation, staff, market share, contracts and rivals.",
            main: {
                stats: [
                    ...group("Finance", [
                        num("Cash", 10000, null, null, "Company cash; negative = debt.", { unit: "$" }),
                        num("Monthly Revenue", 0, 0, null, "Income per in-game month.", { unit: "$" }),
                        num("Monthly Expenses", 0, 0, null, "Costs per in-game month.", { unit: "$", onChange: "At each month end: Cash += Monthly Revenue − Monthly Expenses; log it in custom.ledger." })
                    ]),
                    ...group("Company", [
                        num("Reputation", 50, 0, 100, "Brand reputation.", { progressBar: bar(TEAL) }),
                        num("Employees", 0, 0, null, "Headcount."),
                        num("Staff Morale", 60, 0, 100, "Team morale; low morale hurts output.", { progressBar: bar(AMBER) }),
                        num("Market Share", 1, 0, 100, "Share of the target market.", { unit: "%" }),
                        text("Company", "", "Company name and industry.")
                    ]),
                    ...group("Personal", [
                        num("Stress", 20, 0, 100, "Founder / manager stress.", { progressBar: bar(RED) }),
                        num("Energy", 100, 0, 100, "Daily energy.", { progressBar: bar(AMBER) })
                    ])
                ],
                custom: { assets: {}, products: {}, competitors: {}, contracts: {}, ledger: [] }
            },
            companion: {
                stats: [
                    ...group("Work", [
                        num("Loyalty", 50, 0, 100, "Loyalty to {{user}} and the company.", { progressBar: bar(TEAL) }),
                        num("Competence", 50, 0, 100, "Skill at their job.", fixed),
                        num("Salary", 0, 0, null, "Monthly salary.", { unit: "$" }),
                        text("Position", "", "Job title.")
                    ]),
                    ...bond(["Stranger", "Colleague", "Employee", "Partner", "Friend", "Rival", "Enemy"])
                ]
            },
            minor: {
                stats: [text("Role", "", "Client, investor, supplier…"), num("Influence", 10, 0, 100, "Weight in the business world."), disposition()]
            }
        }
    ];
}
