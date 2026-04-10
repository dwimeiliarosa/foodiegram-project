--
-- PostgreSQL database dump
--

\restrict kKGbebfPqTkGfCbyxpjRlafaBqDQodAxccZgJ5ecZ7YkyIiIgsRetPa6mL1Wtyv

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-10 11:32:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24804)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24803)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 229 (class 1259 OID 24876)
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24839)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    user_id integer,
    recipe_id integer
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24838)
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.likes_id_seq OWNER TO postgres;

--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 225
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- TOC entry 224 (class 1259 OID 24813)
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    user_id integer,
    category_id integer,
    title character varying(255) NOT NULL,
    post_type character varying(20) DEFAULT 'photo'::character varying,
    image_url text,
    video_url text,
    ingredients text[],
    steps text,
    cooking_time integer DEFAULT 0 NOT NULL,
    protein double precision DEFAULT 0 NOT NULL,
    carbs double precision DEFAULT 0 NOT NULL,
    fat double precision DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    views_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24812)
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO postgres;

--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 223
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- TOC entry 228 (class 1259 OID 24859)
-- Name: saves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saves (
    id integer NOT NULL,
    user_id integer,
    recipe_id integer
);


ALTER TABLE public.saves OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24858)
-- Name: saves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saves_id_seq OWNER TO postgres;

--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 227
-- Name: saves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saves_id_seq OWNED BY public.saves.id;


--
-- TOC entry 220 (class 1259 OID 24786)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    photo_profile text,
    bio text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24785)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4782 (class 2604 OID 24807)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24842)
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- TOC entry 4783 (class 2604 OID 24816)
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 24862)
-- Name: saves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saves ALTER COLUMN id SET DEFAULT nextval('public.saves_id_seq'::regclass);


--
-- TOC entry 4779 (class 2604 OID 24789)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4975 (class 0 OID 24804)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
1	Dessert
2	Main Course
3	Drink
4	Seafood
6	Traditional Food
\.


--
-- TOC entry 4982 (class 0 OID 24876)
-- Dependencies: 229
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (follower_id, following_id, created_at) FROM stdin;
2	1	2026-04-08 15:14:55.774505
\.


--
-- TOC entry 4979 (class 0 OID 24839)
-- Dependencies: 226
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, user_id, recipe_id) FROM stdin;
5	1	7
6	2	7
\.


--
-- TOC entry 4977 (class 0 OID 24813)
-- Dependencies: 224
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipes (id, user_id, category_id, title, post_type, image_url, video_url, ingredients, steps, cooking_time, protein, carbs, fat, created_at, views_count, updated_at) FROM stdin;
4	1	2	Salmon Grill Sehat	photo	http://localhost:9000/foodiegram/recipes/1775545994378-salmon.jpg.webp	\N	{Salmon,Lemon,Rosemary,Garam}	1. Cuci salmon, 2. Marinasai, 3. Panggang 15 menit	20	25.5	5	12.2	2026-04-07 14:13:14.85344	0	2026-04-07 14:13:14.85344
7	1	1	Macaron	photo	http://localhost:9000/foodiegram/recipes/1775548326529-macaron.jpg.webp	\N	{gula,telur,tepung,"baking soda"}	1.masukan telur, 2. tepung dan  gula, 3. Panggang 15 menit	20	25.5	5	12.2	2026-04-07 14:52:07.15586	0	2026-04-07 14:52:07.15586
\.


--
-- TOC entry 4981 (class 0 OID 24859)
-- Dependencies: 228
-- Data for Name: saves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saves (id, user_id, recipe_id) FROM stdin;
2	1	7
3	2	7
\.


--
-- TOC entry 4973 (class 0 OID 24786)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, photo_profile, bio, created_at, role) FROM stdin;
2	adminwanda	adminwanda@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ruKtzOAVd8cLQRF1lFv/bQ$ObKieMMsT73QxrVeqB9T8JlAcCjDkwn3qIef6Xs9Bls	\N	\N	2026-04-07 12:53:36.877205	user
1	admindwi	admindwi@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$fm6ltj/6tZi1xL26JyRx1Q$MnEFj9ky9D36ioJtZgdqVSQ1iHTlf0+kq8RxxSAR3q8	\N	\N	2026-04-06 16:31:16.795733	admin
\.


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 225
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.likes_id_seq', 6, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 223
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipes_id_seq', 7, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 227
-- Name: saves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saves_id_seq', 3, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4802 (class 2606 OID 24811)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 24882)
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- TOC entry 4808 (class 2606 OID 24845)
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 24847)
-- Name: likes likes_user_id_recipe_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_recipe_id_key UNIQUE (user_id, recipe_id);


--
-- TOC entry 4806 (class 2606 OID 24827)
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 24865)
-- Name: saves saves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saves
    ADD CONSTRAINT saves_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 24897)
-- Name: saves unique_user_save; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saves
    ADD CONSTRAINT unique_user_save UNIQUE (user_id, recipe_id);


--
-- TOC entry 4796 (class 2606 OID 24802)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4798 (class 2606 OID 24798)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 24800)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4803 (class 1259 OID 33096)
-- Name: idx_recipes_ingredients; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipes_ingredients ON public.recipes USING gin (ingredients);


--
-- TOC entry 4804 (class 1259 OID 33095)
-- Name: idx_recipes_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipes_title ON public.recipes USING gin (to_tsvector('indonesian'::regconfig, (title)::text));


--
-- TOC entry 4823 (class 2606 OID 24883)
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4824 (class 2606 OID 24888)
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4819 (class 2606 OID 24853)
-- Name: likes likes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- TOC entry 4820 (class 2606 OID 24848)
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4817 (class 2606 OID 24833)
-- Name: recipes recipes_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 4818 (class 2606 OID 24828)
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4821 (class 2606 OID 24871)
-- Name: saves saves_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saves
    ADD CONSTRAINT saves_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- TOC entry 4822 (class 2606 OID 24866)
-- Name: saves saves_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saves
    ADD CONSTRAINT saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-04-10 11:32:08

--
-- PostgreSQL database dump complete
--

\unrestrict kKGbebfPqTkGfCbyxpjRlafaBqDQodAxccZgJ5ecZ7YkyIiIgsRetPa6mL1Wtyv

